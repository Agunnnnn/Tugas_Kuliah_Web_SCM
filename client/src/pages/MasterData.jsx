import React, { useState, useEffect, useMemo } from "react";
import { apiRequest } from "../lib/api";
import {
  Database,
  Plus,
  Search,
  Users,
  Package,
  Phone,
  Clock,
  MapPin,
  X,
  Layers,
} from "lucide-react";

const MasterData = () => {
  const [master, setMaster] = useState({ items: [], suppliers: [] });
  const [activeTab, setActiveTab] = useState("items"); // 'items' | 'suppliers'
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Item State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [sku, setSku] = useState("");
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("Bahan Baku");
  const [unit, setUnit] = useState("kg");
  const [minStock, setMinStock] = useState(10);
  const [unitCost, setUnitCost] = useState(50000);
  const [submittingItem, setSubmittingItem] = useState(false);

  // Modal Supplier State
  const [isSupModalOpen, setIsSupModalOpen] = useState(false);
  const [supCode, setSupCode] = useState("");
  const [supName, setSupName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [leadTimeDays, setLeadTimeDays] = useState(2);
  const [address, setAddress] = useState("");
  const [submittingSup, setSubmittingSup] = useState(false);

  useEffect(() => {
    fetchMaster();
  }, []);

  const fetchMaster = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/master");
      setMaster(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setSubmittingItem(true);
    try {
      await apiRequest("/items", {
        method: "POST",
        body: JSON.stringify({
          sku: sku.trim().toUpperCase(),
          name: itemName.trim(),
          category: category.trim(),
          unit: unit.trim().toLowerCase(),
          min_stock: Number(minStock),
          unit_cost: Number(unitCost),
        }),
      });
      setSku("");
      setItemName("");
      setIsItemModalOpen(false);
      fetchMaster();
    } catch (err) {
      alert("Gagal menambahkan SKU: " + err.message);
    } finally {
      setSubmittingItem(false);
    }
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    setSubmittingSup(true);
    try {
      await apiRequest("/suppliers", {
        method: "POST",
        body: JSON.stringify({
          code: supCode.trim().toUpperCase(),
          name: supName.trim(),
          contact_person: contactPerson.trim(),
          phone: phone.trim(),
          lead_time_days: Number(leadTimeDays),
          address: address.trim(),
        }),
      });
      setSupCode("");
      setSupName("");
      setContactPerson("");
      setPhone("");
      setAddress("");
      setIsSupModalOpen(false);
      fetchMaster();
    } catch (err) {
      alert("Gagal menambahkan Supplier: " + err.message);
    } finally {
      setSubmittingSup(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return master.items;
    const q = searchQuery.toLowerCase();
    return master.items.filter(
      (it) =>
        it.sku?.toLowerCase().includes(q) ||
        it.name?.toLowerCase().includes(q) ||
        it.category?.toLowerCase().includes(q)
    );
  }, [master.items, searchQuery]);

  const filteredSuppliers = useMemo(() => {
    if (!searchQuery.trim()) return master.suppliers;
    const q = searchQuery.toLowerCase();
    return master.suppliers.filter(
      (s) =>
        s.code?.toLowerCase().includes(q) ||
        s.name?.toLowerCase().includes(q) ||
        s.contact_person?.toLowerCase().includes(q) ||
        s.address?.toLowerCase().includes(q)
    );
  }, [master.suppliers, searchQuery]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Master Data & Konfigurasi Entitas
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Pengelolaan katalog SKU produk, satuan, batas minimum stok, dan direktori rekanan vendor.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "items" ? (
            <button
              onClick={() => setIsItemModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 transition shadow-sm shadow-blue-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah SKU Baru</span>
            </button>
          ) : (
            <button
              onClick={() => setIsSupModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 transition shadow-sm shadow-blue-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Supplier</span>
            </button>
          )}
        </div>
      </div>

      {/* TABS & SEARCH TOOLBAR */}
      <div className="bg-[#161b22] border border-slate-800 rounded-xl p-3 px-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => {
              setActiveTab("items");
              setSearchQuery("");
            }}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "items"
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Katalog SKU ({master.items.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("suppliers");
              setSearchQuery("");
            }}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "suppliers"
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Direktori Supplier ({master.suppliers.length})</span>
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={activeTab === "items" ? "Cari SKU, nama, kategori..." : "Cari kode, nama vendor, PIC..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* CONTENT TABLES */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs">Memuat master data...</p>
        </div>
      ) : activeTab === "items" ? (
        <div className="bg-[#161b22] border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0d1117]/60 text-slate-400 font-medium">
                  <th className="py-2.5 px-4 w-32">Kode SKU</th>
                  <th className="py-2.5 px-4">Nama Barang</th>
                  <th className="py-2.5 px-4">Kategori</th>
                  <th className="py-2.5 px-4">Satuan</th>
                  <th className="py-2.5 px-4 text-right">Ambang Min. Stok</th>
                  <th className="py-2.5 px-4 text-right">Estimasi Biaya Beli</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredItems.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-mono font-semibold text-blue-400 text-[11px]">
                      {it.sku}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-200">
                      {it.name}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                        {it.category || "Umum"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{it.unit}</td>
                    <td className="py-3 px-4 text-right text-slate-300 font-mono">
                      {it.min_stock} {it.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-200">
                      Rp {Number(it.unit_cost || 0).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredSuppliers.map((sup) => (
            <div
              key={sup.id}
              className="bg-[#161b22] border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <span className="font-mono text-xs font-semibold text-blue-400">
                  {sup.code}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-slate-500" />
                  Lead time: {sup.lead_time_days} hari
                </span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white">{sup.name}</h3>
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                  <Phone className="w-3 h-3 text-slate-500" />
                  <span>PIC: {sup.contact_person || "-"} ({sup.phone || "-"})</span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-slate-600" />
                  <span className="truncate">{sup.address || "Alamat belum dilengkapi"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL TAMBAH SKU */}
      {isItemModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => !submittingItem && setIsItemModalOpen(false)}
        >
          <div
            className="bg-[#161b22] border border-slate-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 px-5 border-b border-slate-800 flex items-center justify-between bg-[#0d1117]/80">
              <h3 className="text-sm font-semibold text-white">Tambah Master Barang (SKU) Baru</h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Kode SKU</label>
                  <input
                    type="text"
                    placeholder="Contoh: SKU-KP06"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-200 text-xs font-mono uppercase outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Satuan</label>
                  <input
                    type="text"
                    placeholder="kg / dus / pack"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-200 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nama Barang</label>
                <input
                  type="text"
                  placeholder="Contoh: Sirup Hazelnut 1L"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-200 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Kategori</label>
                <input
                  type="text"
                  placeholder="Bahan Baku / Kemasan / Topping"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-200 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Batas Minimum Stok</label>
                  <input
                    type="number"
                    min="1"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-200 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Harga Beli Satuan (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-200 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-3 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingItem}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium"
                >
                  {submittingItem ? "Menyimpan..." : "Simpan Barang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH SUPPLIER */}
      {isSupModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => !submittingSup && setIsSupModalOpen(false)}
        >
          <div
            className="bg-[#161b22] border border-slate-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 px-5 border-b border-slate-800 flex items-center justify-between bg-[#0d1117]/80">
              <h3 className="text-sm font-semibold text-white">Tambah Mitra Supplier Baru</h3>
              <button
                onClick={() => setIsSupModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSupplier} className="p-5 space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Kode</label>
                  <input
                    type="text"
                    placeholder="SUP-008"
                    value={supCode}
                    onChange={(e) => setSupCode(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-200 text-xs font-mono uppercase outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nama Perusahaan / CV</label>
                  <input
                    type="text"
                    placeholder="PT Aneka Rasa Pangan"
                    value={supName}
                    onChange={(e) => setSupName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-200 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Kontak Person (PIC)</label>
                  <input
                    type="text"
                    placeholder="Nama PIC"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-200 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nomor Telepon / WA</label>
                  <input
                    type="text"
                    placeholder="0812xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-200 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Estimasi Lead Time (Hari)</label>
                <input
                  type="number"
                  min="1"
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-200 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Alamat Gudang / Kantor Supplier</label>
                <textarea
                  rows={2}
                  placeholder="Kawasan Industri, Kota..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-200 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSupModalOpen(false)}
                  className="px-3 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingSup}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium"
                >
                  {submittingSup ? "Menyimpan..." : "Simpan Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterData;
