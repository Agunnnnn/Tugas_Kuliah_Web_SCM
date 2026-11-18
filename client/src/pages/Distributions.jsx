import React, { useState, useEffect, useMemo } from "react";
import { apiRequest } from "../lib/api";
import {
  Truck,
  Send,
  CheckCircle2,
  Plus,
  Search,
  MapPin,
  Clock,
  ArrowRight,
  User,
  X,
  FileCheck,
  ShieldAlert,
} from "lucide-react";

const Distributions = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [master, setMaster] = useState({ locations: [], items: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'Pending' | 'Dikirim' | 'Diterima'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fromWarehouseId, setFromWarehouseId] = useState("");
  const [toBranchId, setToBranchId] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState(5);
  const [driverName, setDriverName] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const branchQuery = user.role === "branch_manager" ? `?branch_id=${user.location_id}` : "";
      const [dist, mst] = await Promise.all([
        apiRequest(`/distributions${branchQuery}`),
        apiRequest("/master"),
      ]);
      setOrders(dist);
      setMaster(mst);

      const wh = mst.locations.find((l) => l.type === "warehouse");
      if (wh) setFromWarehouseId(wh.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDO = async (e) => {
    e.preventDefault();
    if (!fromWarehouseId || !toBranchId || !selectedItemId) return;
    setSubmitting(true);
    try {
      await apiRequest("/distributions", {
        method: "POST",
        body: JSON.stringify({
          from_warehouse_id: fromWarehouseId,
          to_branch_id: toBranchId,
          driver_name: driverName.trim() || "Armada Logistik Pusat",
          notes: notes.trim() || "Pengiriman reguler cabang",
          created_by: user.id,
          items: [{ item_id: selectedItemId, quantity: Number(quantity) }],
        }),
      });
      setDriverName("");
      setNotes("");
      setQuantity(5);
      setSelectedItemId("");
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert("Gagal menerbitkan surat jalan: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status, doNumber) => {
    let confirmMsg = "";
    if (status === "Dikirim") {
      confirmMsg = `Kirim armada untuk surat jalan ${doNumber}?\nStok di Gudang Pusat akan langsung dipotong.`;
    } else if (status === "Diterima") {
      confirmMsg = `Konfirmasi penerimaan barang untuk ${doNumber}?\nStok toko cabang akan langsung ditambahkan.`;
    }

    if (confirmMsg && !window.confirm(confirmMsg)) return;

    try {
      await apiRequest(`/distributions/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      loadData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const warehouses = master.locations.filter((l) => l.type === "warehouse");
  const branches = master.locations.filter((l) => l.type === "branch");

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const doMatch = o.do_number?.toLowerCase().includes(q);
        const driverMatch = o.driver_name?.toLowerCase().includes(q);
        const branchMatch = o.to_branch?.name?.toLowerCase().includes(q);
        const itemMatch = o.distribution_items?.some((it) =>
          it.items?.name?.toLowerCase().includes(q)
        );
        if (!doMatch && !driverMatch && !branchMatch && !itemMatch) return false;
      }
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Distribusi Logistik ke Cabang (Outbound DO)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Penerbitan surat jalan, pemantauan status pengiriman armada, dan serah terima barang toko.
          </p>
        </div>

        {user.role !== "branch_manager" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 transition shadow-sm shadow-blue-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Terbitkan Surat Jalan (DO)</span>
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
            Semua ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter("Pending")}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              statusFilter === "Pending"
                ? "bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            Menunggu Kirim ({orders.filter((o) => o.status === "Pending").length})
          </button>
          <button
            onClick={() => setStatusFilter("Dikirim")}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              statusFilter === "Dikirim"
                ? "bg-sky-500/15 text-sky-300 font-semibold border border-sky-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            Dalam Perjalanan ({orders.filter((o) => o.status === "Dikirim").length})
          </button>
          <button
            onClick={() => setStatusFilter("Diterima")}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              statusFilter === "Diterima"
                ? "bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            Selesai Tiba ({orders.filter((o) => o.status === "Diterima").length})
          </button>
        </div>

        {/* SEARCH */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari No. DO, driver, cabang, barang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* DO LISTING */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs">Memuat data pengiriman cabang...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-[#161b22] border border-slate-800 rounded-xl p-12 text-center text-slate-400 space-y-2">
          <Truck className="w-8 h-8 text-slate-600 mx-auto" />
          <div className="text-sm font-medium text-slate-300">Tidak ada data distribusi pengiriman</div>
          <div className="text-xs text-slate-500">
            {searchQuery ? "Coba sesuaikan kata kunci pencarian Anda." : "Surat jalan distribusi akan tampil di sini."}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((d) => {
            const dateStr = new Date(d.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            const statusConfig = {
              Pending: {
                label: "Menunggu Berangkat",
                dotBg: "bg-amber-400",
                badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                step: 1,
              },
              Dikirim: {
                label: "Sedang Dalam Perjalanan",
                dotBg: "bg-sky-400",
                badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/20",
                step: 2,
              },
              Diterima: {
                label: "Telah Diterima Toko",
                dotBg: "bg-emerald-400",
                badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                step: 3,
              },
            }[d.status] || {
              label: d.status,
              dotBg: "bg-slate-400",
              badgeClass: "bg-slate-500/10 text-slate-400 border-slate-500/20",
              step: 1,
            };

            return (
              <div
                key={d.id}
                className="bg-[#161b22] border border-slate-800 hover:border-slate-700 rounded-xl p-4 sm:p-5 transition space-y-3.5"
              >
                {/* TOP BAR OF CARD */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-blue-400">
                      {d.do_number}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusConfig.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotBg}`}></span>
                      {statusConfig.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{dateStr}</span>
                  </div>
                </div>

                {/* ROUTE & DRIVER INFO */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      Rute Pengiriman
                    </span>
                    <div className="mt-1 flex items-center gap-1.5 font-medium text-slate-200">
                      <span className="text-slate-400">{d.from_warehouse?.name || "Gudang Pusat"}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="text-white font-semibold">{d.to_branch?.name}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      Pengemudi / Armada
                    </span>
                    <div className="mt-1 flex items-center gap-1.5 font-medium text-slate-200">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{d.driver_name || "Armada Reguler"}</span>
                    </div>
                    {d.notes && (
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Catatan: {d.notes}
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      Daftar Muatan Barang
                    </span>
                    <div className="mt-1 space-y-1">
                      {d.distribution_items?.map((it) => (
                        <div key={it.id} className="text-slate-200">
                          <strong>{it.items?.name}</strong>: {it.quantity} {it.items?.unit}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* BOTTOM ACTION BAR */}
                <div className="pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Stepper indicator */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className={statusConfig.step >= 1 ? "text-blue-400 font-semibold" : ""}>
                      1. Draft DO
                    </span>
                    <span>→</span>
                    <span className={statusConfig.step >= 2 ? "text-sky-400 font-semibold" : ""}>
                      2. Jalan
                    </span>
                    <span>→</span>
                    <span className={statusConfig.step >= 3 ? "text-emerald-400 font-semibold" : ""}>
                      3. Diterima Toko
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2">
                    {d.status === "Pending" && user.role !== "branch_manager" && (
                      <button
                        onClick={() => handleUpdateStatus(d.id, "Dikirim", d.do_number)}
                        className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shadow-sm shadow-sky-600/20"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Kirim Armada (Potong Stok Gudang)</span>
                      </button>
                    )}

                    {d.status === "Dikirim" && (
                      <button
                        onClick={() => handleUpdateStatus(d.id, "Diterima", d.do_number)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shadow-sm shadow-emerald-600/20"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Konfirmasi Penerimaan Cabang</span>
                      </button>
                    )}

                    {d.status === "Diterima" && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <FileCheck className="w-4 h-4 text-emerald-400" />
                        <span>Stok Berhasil Dibukukan ke Cabang</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL BUAT DO BARU */}
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
                  <Send className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-white">
                  Penerbitan Surat Jalan Distribusi (DO)
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

            <form onSubmit={handleCreateDO} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Gudang Asal Pengirim
                </label>
                <select
                  value={fromWarehouseId}
                  onChange={(e) => setFromWarehouseId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-200 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Cabang Toko Tujuan
                </label>
                <select
                  value={toBranchId}
                  onChange={(e) => setToBranchId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-200 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Pilih Cabang Toko --</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.address})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Barang / SKU yang Dialokasikan
                  </label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-200 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih SKU --</option>
                    {master.items.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.sku} - {i.name} ({i.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Jumlah Kirim
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

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nama Driver & Armada Kendaraan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pak Joko (Blindvan B 1234 SCM)"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-200 text-xs outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Catatan Distribusi (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pasokan kopi & cup akhir pekan"
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
                  {submitting ? "Menerbitkan..." : "Terbitkan Surat Jalan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Distributions;
