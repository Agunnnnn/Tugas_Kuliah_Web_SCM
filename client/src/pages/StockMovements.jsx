import React, { useState, useEffect, useMemo } from "react";
import { apiRequest } from "../lib/api";
import {
  History,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Download,
  Calendar,
  MapPin,
  FileText,
  Filter,
} from "lucide-react";

const StockMovements = ({ user }) => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // 'all' | 'IN' | 'OUT'

  useEffect(() => {
    fetchMovements();
  }, [user]);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const q = user.role === "branch_manager" ? `?location_id=${user.location_id}` : "";
      const data = await apiRequest(`/movements${q}`);
      setMovements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      if (typeFilter !== "all" && m.type !== typeFilter) return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const refMatch = m.reference_no?.toLowerCase().includes(q);
        const itemMatch = m.items?.name?.toLowerCase().includes(q);
        const skuMatch = m.items?.sku?.toLowerCase().includes(q);
        const locMatch = m.locations?.name?.toLowerCase().includes(q);
        const descMatch = m.description?.toLowerCase().includes(q);
        if (!refMatch && !itemMatch && !skuMatch && !locMatch && !descMatch) return false;
      }
      return true;
    });
  }, [movements, typeFilter, searchQuery]);

  const handleExportCSV = () => {
    if (filteredMovements.length === 0) return;
    const headers = ["Waktu", "No Referensi", "Lokasi", "SKU", "Nama Barang", "Tipe", "Jumlah", "Satuan", "Keterangan"];
    const rows = filteredMovements.map((m) => [
      `"${new Date(m.created_at).toLocaleString("id-ID")}"`,
      m.reference_no || "-",
      `"${m.locations?.name || "-"}"`,
      m.items?.sku || "-",
      `"${m.items?.name || "-"}"`,
      m.type,
      m.quantity,
      m.items?.unit || "unit",
      `"${m.description?.replace(/"/g, '""') || "-"}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `log_mutasi_stok_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Buku Besar & Log Audit Mutasi Stok
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Jejak kronologis penerimaan (IN) dan pengeluaran (OUT) seluruh barang rantai pasok.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 rounded-lg border border-slate-700 hover:border-slate-600 bg-[#161b22] hover:bg-slate-800 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Ekspor Jurnal CSV</span>
        </button>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="bg-[#161b22] border border-slate-800 rounded-xl p-3 px-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              typeFilter === "all"
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            Semua Arah ({movements.length})
          </button>
          <button
            onClick={() => setTypeFilter("IN")}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
              typeFilter === "IN"
                ? "bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Masuk / IN ({movements.filter((m) => m.type === "IN").length})</span>
          </button>
          <button
            onClick={() => setTypeFilter("OUT")}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
              typeFilter === "OUT"
                ? "bg-rose-500/15 text-rose-300 font-semibold border border-rose-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Keluar / OUT ({movements.filter((m) => m.type === "OUT").length})</span>
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari no. ref, SKU, atau barang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-[#161b22] border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs">Memuat riwayat audit mutasi...</p>
          </div>
        ) : filteredMovements.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            Tidak ada catatan mutasi stok yang sesuai.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0d1117]/60 text-slate-400 font-medium">
                  <th className="py-2.5 px-4">Waktu Transaksi</th>
                  <th className="py-2.5 px-4">No. Dokumen</th>
                  <th className="py-2.5 px-4">Fasilitas / Lokasi</th>
                  <th className="py-2.5 px-4">Barang (SKU)</th>
                  <th className="py-2.5 px-4 text-center">Tipe</th>
                  <th className="py-2.5 px-4 text-right">Kuantitas</th>
                  <th className="py-2.5 px-4">Keterangan Aktivitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredMovements.map((m) => {
                  const isIN = m.type === "IN";
                  const dateStr = new Date(m.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={m.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] font-semibold text-blue-400">
                        {m.reference_no || "-"}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{m.locations?.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-200">{m.items?.name}</span>
                        <span className="block text-[10px] text-slate-500 font-mono">
                          {m.items?.sku}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isIN ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <ArrowDownLeft className="w-3 h-3" />
                            <span>MASUK</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <ArrowUpRight className="w-3 h-3" />
                            <span>KELUAR</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold">
                        <span className={isIN ? "text-emerald-400" : "text-rose-400"}>
                          {isIN ? `+${m.quantity}` : `-${m.quantity}`}
                        </span>{" "}
                        <span className="text-[10px] text-slate-500 font-normal">
                          {m.items?.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate text-[11px]">
                        {m.description || "Pergerakan stok reguler"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockMovements;
