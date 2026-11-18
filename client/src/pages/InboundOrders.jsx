import React, { useState, useEffect, useMemo } from "react";
import { apiRequest } from "../lib/api";
import {
  ArrowDownToLine,
  CheckCircle2,
  Plus,
  Search,
  Building2,
  Calendar,
  X,
  FileText,
  Clock,
  PackageCheck,
} from "lucide-react";

const InboundOrders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [master, setMaster] = useState({ suppliers: [], locations: [], items: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'Draft' | 'Diterima'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState(20);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [inb, mst] = await Promise.all([
        apiRequest("/inbound"),
        apiRequest("/master"),
      ]);
      setOrders(inb);
      setMaster(mst);
      const defaultWh = mst.locations.find((l) => l.type === "warehouse");
      if (defaultWh) setWarehouseId(defaultWh.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePO = async (e) => {
    e.preventDefault();
    if (!supplierId || !warehouseId || !selectedItemId) return;
    setSubmitting(true);
    try {
      const chosenItem = master.items.find((i) => i.id === selectedItemId);
      await apiRequest("/inbound", {
        method: "POST",
        body: JSON.stringify({
          supplier_id: supplierId,
          warehouse_id: warehouseId,
          notes: notes.trim() || "Pengadaan bahan baku rutin",
          created_by: user.id,
          items: [
            {
              item_id: selectedItemId,
              quantity: Number(quantity),
              unit_cost: chosenItem?.unit_cost || 0,
            },
          ],
        }),
      });
      setNotes("");
      setQuantity(20);
      setSelectedItemId("");
      setIsModalOpen(false);
      loadAll();
    } catch (err) {
      alert("Gagal membuat PO: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReceive = async (id, poNumber) => {
    const confirm = window.confirm(
      `Konfirmasi penerimaan barang untuk ${poNumber}?\nStok fisik di Gudang Pusat akan otomatis ditambahkan.`
    );
    if (!confirm) return;

    try {
      await apiRequest(`/inbound/${id}/receive`, { method: "PATCH" });
      loadAll();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const warehouses = master.locations.filter((l) => l.type === "warehouse");

  // Filtering orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const poMatch = o.po_number?.toLowerCase().includes(q);
        const supMatch = o.suppliers?.name?.toLowerCase().includes(q);
        const itemMatch = o.inbound_items?.some((it) =>
          it.items?.name?.toLowerCase().includes(q)
        );
        if (!poMatch && !supMatch && !itemMatch) return false;
      }
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  const selectedItemObj = master.items.find((i) => i.id === selectedItemId);
  const estimatedCost = (Number(quantity) || 0) * (Number(selectedItemObj?.unit_cost) || 0);

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Pengadaan Barang Masuk (Inbound PO)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Pemesanan pembelian ke supplier dan pencatatan barang tiba di Gudang Pusat.
          </p>
        </div>

        {user.role !== "branch_manager" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 transition shadow-sm shadow-blue-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Terbitkan PO Baru</span>
          </button>
        )}
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-[#161b22] border border-slate-800 rounded-xl p-3 px-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* TABS STATUS */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              statusFilter === "all"
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            Semua PO ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter("Draft")}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              statusFilter === "Draft"
                ? "bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            Menunggu Kedatangan ({orders.filter((o) => o.status === "Draft").length})
          </button>
          <button
            onClick={() => setStatusFilter("Diterima")}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              statusFilter === "Diterima"
                ? "bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            Selesai Diterima ({orders.filter((o) => o.status === "Diterima").length})
          </button>
        </div>

        {/* SEARCH */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari No. PO, Supplier, atau item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* PO LISTING */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs">Memuat daftar PO...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-[#161b22] border border-slate-800 rounded-xl p-12 text-center text-slate-400 space-y-2">
          <FileText className="w-8 h-8 text-slate-600 mx-auto" />
          <div className="text-sm font-medium text-slate-300">Tidak ada Purchase Order ditemukan</div>
          <div className="text-xs text-slate-500">
            {searchQuery ? "Coba ubah kata kunci pencarian Anda." : "Klik 'Terbitkan PO Baru' untuk membuat pesanan ke supplier."}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((po) => {
            const isDraft = po.status === "Draft";
            const dateStr = new Date(po.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            const totalPoValue = (po.inbound_items || []).reduce(
              (acc, it) => acc + Number(it.quantity) * Number(it.unit_cost || 0),
              0
            );

            return (
              <div
                key={po.id}
                className="bg-[#161b22] border border-slate-800 hover:border-slate-700 rounded-xl p-4 sm:p-5 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-blue-400">
                      {po.po_number}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                        isDraft
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${isDraft ? "bg-amber-400" : "bg-emerald-400"}`}
                      ></span>
                      {isDraft ? "Menunggu Penerimaan Fisik" : "Barang Telah Diterima"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{dateStr}</span>
                  </div>
                </div>

                <div className="py-3.5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      Mitra Pemasok / Vendor
                    </span>
                    <span className="font-medium text-slate-200 mt-0.5 block">
                      {po.suppliers?.name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Kode: {po.suppliers?.code || "-"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      Gudang Tujuan Penerimaan
                    </span>
                    <span className="font-medium text-slate-200 mt-0.5 block">
                      {po.locations?.name || "Gudang Pusat"}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Catatan: {po.notes || "-"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      Rincian Order & Valuasi
                    </span>
                    <div className="mt-0.5 space-y-1">
                      {po.inbound_items?.map((it) => (
                        <div key={it.id} className="text-slate-200">
                          <strong>{it.items?.name}</strong>: {it.quantity} {it.items?.unit}
                        </div>
                      ))}
                      <div className="text-[11px] text-slate-400 font-mono pt-1">
                        Total Estimasi: Rp {totalPoValue.toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>
                </div>

                {isDraft && (
                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Barang belum dibukukan ke stok hingga dikonfirmasi fisik.</span>
                    </div>

                    <button
                      onClick={() => handleConfirmReceive(po.id, po.po_number)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shadow-sm shadow-emerald-600/20"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Konfirmasi Barang Tiba</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL BUAT PO BARU */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => !submitting && setIsModalOpen(false)}
        >
          <div
            className="bg-[#161b22] border border-slate-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 px-5 border-b border-slate-800 flex items-center justify-between bg-[#0d1117]/80">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <ArrowDownToLine className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-white">
                  Form Penerbitan Purchase Order (PO)
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Pilih Supplier / Vendor
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-200 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Pilih Supplier --</option>
                  {master.suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) - Lead time: {s.lead_time_days} hari
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Gudang Tujuan Penerimaan
                </label>
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-200 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} - {w.address}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Barang / SKU yang Dipesan
                  </label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-200 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Barang --</option>
                    {master.items.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.sku} - {i.name} ({i.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Jumlah ({selectedItemObj?.unit || "Unit"})
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-200 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {selectedItemObj && (
                <div className="p-3 rounded-lg bg-[#0d1117] border border-slate-800 text-xs flex justify-between items-center">
                  <span className="text-slate-400">Estimasi Total Biaya PO:</span>
                  <span className="font-semibold text-white font-mono">
                    Rp {estimatedCost.toLocaleString("id-ID")}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Catatan / Instruksi Pengiriman (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pengadaan darurat untuk antisipasi weekend"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-200 text-xs outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-3 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition cursor-pointer shadow-sm shadow-blue-600/20 disabled:opacity-50"
                >
                  {submitting ? "Memproses..." : "Terbitkan PO Sekarang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InboundOrders;
