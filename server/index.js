import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./supabaseClient.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ============================================================================
// 1. HEALTH CHECK
// ============================================================================
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "SupplyChainKu API Server is running" });
});

// ============================================================================
// 2. AUTHENTICATION (LOGIN USER SCM)
// ============================================================================
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const { data, error } = await supabase
      .from("scm_users")
      .select("*, locations(id, code, name, type)")
      .eq("username", username.trim().toLowerCase())
      .eq("password", password)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: "Username atau password salah!" });
    }

    const { password: _, ...safeUser } = data;
    res.json({ user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// 3. DASHBOARD SUMMARY & RINGKASAN STOK
// ============================================================================
app.get("/api/dashboard", async (req, res) => {
  const { location_id, role } = req.query;
  try {
    let stockQuery = supabase
      .from("location_stocks")
      .select("*, locations(id, code, name, type), items(id, sku, name, category, unit, min_stock, unit_cost)")
      .order("updated_at", { ascending: false });

    if (role === "branch_manager" && location_id) {
      stockQuery = stockQuery.eq("location_id", location_id);
    }

    const { data: stocks, error: stockErr } = await stockQuery;
    if (stockErr) throw stockErr;

    const { data: suppliers } = await supabase.from("suppliers").select("id").eq("is_active", true);
    const { data: pendingDist } = await supabase
      .from("distribution_orders")
      .select("id")
      .in("status", ["Pending", "Dikirim"]);

    const lowStockItems = (stocks || []).filter(
      (s) => s.quantity <= (s.items?.min_stock || 10)
    );

    const totalInventoryValue = (stocks || []).reduce(
      (acc, curr) => acc + curr.quantity * Number(curr.items?.unit_cost || 0),
      0
    );

    res.json({
      stats: {
        totalSkuCount: stocks?.length || 0,
        lowStockCount: lowStockItems.length,
        activeSuppliers: suppliers?.length || 0,
        activeDistributions: pendingDist?.length || 0,
        totalInventoryValue,
      },
      stocks: stocks || [],
      lowStockItems,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// 4. MASTER DATA: LOKASI, ITEMS & SUPPLIERS
// ============================================================================
app.get("/api/master", async (req, res) => {
  try {
    const [locRes, itemRes, supRes] = await Promise.all([
      supabase.from("locations").select("*").eq("is_active", true).order("type", { ascending: false }),
      supabase.from("items").select("*").eq("is_active", true).order("name"),
      supabase.from("suppliers").select("*").eq("is_active", true).order("name"),
    ]);

    res.json({
      locations: locRes.data || [],
      items: itemRes.data || [],
      suppliers: supRes.data || [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tambah Item Baru
app.post("/api/items", async (req, res) => {
  const { sku, name, category, unit, min_stock, unit_cost } = req.body;
  try {
    const { data, error } = await supabase
      .from("items")
      .insert([{ sku, name, category, unit, min_stock: Number(min_stock), unit_cost: Number(unit_cost) }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Tambah Supplier Baru
app.post("/api/suppliers", async (req, res) => {
  const { code, name, contact_person, phone, lead_time_days, address } = req.body;
  try {
    const { data, error } = await supabase
      .from("suppliers")
      .insert([{ code, name, contact_person, phone, lead_time_days: Number(lead_time_days || 2), address }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================================================
// 5. PENGADAAN HULU / INBOUND ORDERS (SUPPLIER -> GUDANG PUSAT)
// ============================================================================
app.get("/api/inbound", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("inbound_orders")
      .select(`
        *,
        suppliers(name, code),
        locations(name),
        inbound_items(*, items(sku, name, unit))
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/inbound", async (req, res) => {
  const { supplier_id, warehouse_id, notes, items, created_by } = req.body;
  try {
    const po_number = "PO-" + Date.now();
    const { data: order, error: orderErr } = await supabase
      .from("inbound_orders")
      .insert([{ po_number, supplier_id, warehouse_id, status: "Draft", notes, created_by }])
      .select()
      .single();

    if (orderErr) throw orderErr;

    const inboundItems = items.map((it) => ({
      inbound_id: order.id,
      item_id: it.item_id,
      quantity: Number(it.quantity),
      unit_cost: Number(it.unit_cost || 0),
    }));

    const { error: itemErr } = await supabase.from("inbound_items").insert(inboundItems);
    if (itemErr) throw itemErr;

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Konfirmasi Penerimaan PO -> Trigger PostgreSQL otomatis menambah stok gudang!
app.patch("/api/inbound/:id/receive", async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from("inbound_orders")
      .update({ status: "Diterima" })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================================================
// 6. DISTRIBUSI HILIR / DELIVERY ORDERS (GUDANG PUSAT -> CABANG)
// ============================================================================
app.get("/api/distributions", async (req, res) => {
  const { branch_id } = req.query;
  try {
    let query = supabase
      .from("distribution_orders")
      .select(`
        *,
        from_warehouse:locations!distribution_orders_from_warehouse_id_fkey(name),
        to_branch:locations!distribution_orders_to_branch_id_fkey(name),
        distribution_items(*, items(sku, name, unit))
      `)
      .order("created_at", { ascending: false });

    if (branch_id) {
      query = query.eq("to_branch_id", branch_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/distributions", async (req, res) => {
  const { from_warehouse_id, to_branch_id, driver_name, notes, items, created_by } = req.body;
  try {
    const do_number = "DO-" + Date.now();
    const { data: distOrder, error: distErr } = await supabase
      .from("distribution_orders")
      .insert([{
        do_number,
        from_warehouse_id,
        to_branch_id,
        status: "Pending",
        driver_name,
        notes,
        created_by,
      }])
      .select()
      .single();

    if (distErr) throw distErr;

    const distItems = items.map((it) => ({
      distribution_id: distOrder.id,
      item_id: it.item_id,
      quantity: Number(it.quantity),
    }));

    const { error: itemErr } = await supabase.from("distribution_items").insert(distItems);
    if (itemErr) throw itemErr;

    res.status(201).json(distOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update Status Distribusi ('Dikirim' -> potong stok gudang, 'Diterima' -> tambah stok cabang)
app.patch("/api/distributions/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const { data, error } = await supabase
      .from("distribution_orders")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================================================
// 7. RIWAYAT AUDIT MUTASI STOK (STOCK MOVEMENTS)
// ============================================================================
app.get("/api/movements", async (req, res) => {
  const { location_id } = req.query;
  try {
    let query = supabase
      .from("stock_movements")
      .select("*, locations(name), items(sku, name, unit)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (location_id) {
      query = query.eq("location_id", location_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server SupplyChainKu berjalan di http://localhost:${PORT}`);
});
