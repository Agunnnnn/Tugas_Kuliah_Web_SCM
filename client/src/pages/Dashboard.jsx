import React, { useState, useEffect, useMemo } from "react";
import { apiRequest } from "../lib/api";
import {
  AlertTriangle,
  Package,
  Truck,
  Users,
  Wallet,
  Search,
  Download,
  Filter,
  X,
  MapPin,
  ChevronRight,
  ChevronLeft,
  ArrowUpDown,
} from "lucide-react";

const Dashboard = ({ user }) => {
  const [data, setData] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'low' | 'safe'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [showLowStockModal, setShowLowStockModal] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        role: user.role,
        location_id: user.location_id || "",
      });
      const res = await apiRequest(`/dashboard?${params.toString()}`);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = data?.stats || {};
  const stocks = data?.stocks || [];
  const lowStockItems = data?.lowStockItems || [];

  // Extract unique locations & categories
  const uniqueLocations = useMemo(() => {
    return Array.from(
      new Map(stocks.map((s) => [s.locations?.id, s.locations])).values()
    ).filter(Boolean);
  }, [stocks]);

  const categories = useMemo(() => {
    const set = new Set();
    stocks.forEach((s) => {
      if (s.items?.category) set.add(s.items.category);
    });
    return Array.from(set);
  }, [stocks]);

  // Filtered stocks calculation
  const filteredStocks = useMemo(() => {
    return stocks.filter((s) => {
      // 1. Location filter
      if (selectedLocation !== "all" && s.location_id !== selectedLocation) {
        return false;
      }
      // 2. Category filter
      if (selectedCategory !== "all" && s.items?.category !== selectedCategory) {
        return false;
      }
      // 3. Status filter
      const isLow = s.quantity <= (s.items?.min_stock || 10);
      if (statusFilter === "low" && !isLow) return false;
      if (statusFilter === "safe" && isLow) return false;

      // 4. Search query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const nameMatch = s.items?.name?.toLowerCase().includes(q);
        const skuMatch = s.items?.sku?.toLowerCase().includes(q);
        const locMatch = s.locations?.name?.toLowerCase().includes(q);
        if (!nameMatch && !skuMatch && !locMatch) return false;
      }
      return true;
    });
  }, [stocks, selectedLocation, selectedCategory, statusFilter, searchQuery]);

  // Pagination slice
  const totalPages = Math.ceil(filteredStocks.length / pageSize) || 1;
  const paginatedStocks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStocks.slice(start, start + pageSize);
  }, [filteredStocks, currentPage]);

  const handleExportCSV = () => {
    if (filteredStocks.length === 0) return;
    const headers = ["SKU", "Nama Barang", "Kategori", "Lokasi", "Stok Tersedia", "Batas Min", "Satuan", "Harga Satuan", "Status"];
    const rows = filteredStocks.map((s) => {
      const isLow = s.quantity <= (s.items?.min_stock || 10);
      return [
        s.items?.sku,
        `"${s.items?.name?.replace(/"/g, '""')}"`,
        s.items?.category,
        `"${s.locations?.name?.replace(/"/g, '""')}"`,
        s.quantity,
        s.items?.min_stock || 10,
        s.items?.unit,
        s.items?.unit_cost || 0,
        isLow ? "Low Stock" : "Aman",
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan_inventaris_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs">Memuat data inventaris rantai pasok...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Monitoring Inventaris & Stok
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Visibilitas saldo stok multi-lokasi, reorder point, dan valuasi aset terkini.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {user.role !== "branch_manager" && (
            <select
              value={selectedLocation}
              onChange={(e) => {
                setSelectedLocation(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-slate-700 bg-[#161b22] text-slate-200 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="all">Semua Fasilitas (Gudang & Toko)</option>
              {uniqueLocations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-lg border border-slate-700 hover:border-slate-600 bg-[#161b22] hover:bg-slate-800 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* METRIC KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#161b22] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Valuasi Inventaris</span>
            <div className="w-7 h-7 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-white tracking-tight">
              Rp {(stats.totalInventoryValue || 0).toLocaleString("id-ID")}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Nilai perolehan stok tersimpan
            </div>
          </div>
        </div>

        <div
          onClick={() => lowStockItems.length > 0 && setShowLowStockModal(true)}
          className={`bg-[#161b22] border rounded-xl p-4 flex flex-col justify-between transition ${
            lowStockItems.length > 0
              ? "border-amber-500/30 hover:border-amber-500/60 cursor-pointer group bg-gradient-to-br from-amber-500/5 to-transparent"
              : "border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Item Stok Menipis</span>
            <div className="w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <div className="text-lg font-bold text-amber-400 tracking-tight">
                {stats.lowStockCount || 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                SKU di bawah reorder point
              </div>
            </div>
            {lowStockItems.length > 0 && (
              <span className="text-[11px] font-medium text-amber-400 group-hover:underline flex items-center gap-0.5">
                Detail <ChevronRight className="w-3 h-3" />
              </span>
            )}
          </div>
        </div>

        <div className="bg-[#161b22] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Distribusi Berjalan</span>
            <div className="w-7 h-7 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-white tracking-tight">
              {stats.activeDistributions || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Surat Jalan pending & armada jalan
            </div>
          </div>
        </div>

        <div className="bg-[#161b22] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Mitra Pemasok Aktif</span>
            <div className="w-7 h-7 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-white tracking-tight">
              {stats.activeSuppliers || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Vendor pengadaan terdaftar
            </div>
          </div>
        </div>
      </div>

      {/* COMPACT LOW STOCK NOTICE BAR */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-amber-200">
                Pemberitahuan Reorder Point ({lowStockItems.length} SKU kritis)
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                Terdapat barang dengan sisa fisik mendekati atau di bawah batas minimum pengamanan.
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowLowStockModal(true)}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs shrink-0 transition flex items-center gap-1 cursor-pointer"
          >
            <span>Tinjau Item</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* INVENTORY TABLE PANEL */}
      <div className="bg-[#161b22] border border-slate-800 rounded-xl overflow-hidden">
        {/* TABLE FILTER BAR */}
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* SEARCH INPUT */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari SKU, nama barang, atau lokasi..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-slate-500"
            />
          </div>

          {/* CATEGORY & STATUS FILTER CHIPS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-300 text-xs outline-none"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <div className="flex items-center rounded-lg border border-slate-700 bg-[#0d1117] p-0.5 text-xs">
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                  statusFilter === "all" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => {
                  setStatusFilter("low");
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                  statusFilter === "low" ? "bg-amber-500/20 text-amber-300 font-semibold" : "text-slate-400 hover:text-white"
                }`}
              >
                Low Stock
              </button>
              <button
                onClick={() => {
                  setStatusFilter("safe");
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                  statusFilter === "safe" ? "bg-emerald-500/20 text-emerald-300 font-semibold" : "text-slate-400 hover:text-white"
                }`}
              >
                Aman
              </button>
            </div>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0d1117]/60 text-slate-400 font-medium">
                <th className="py-2.5 px-4 w-28">Kode SKU</th>
                <th className="py-2.5 px-4">Nama Barang & Kategori</th>
                <th className="py-2.5 px-4">Fasilitas / Lokasi</th>
                <th className="py-2.5 px-4 text-right">Stok Fisik</th>
                <th className="py-2.5 px-4 text-right">Ambang Min.</th>
                <th className="py-2.5 px-4 text-right">Harga Satuan</th>
                <th className="py-2.5 px-4 text-center w-28">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedStocks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Tidak ada data barang yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                paginatedStocks.map((row) => {
                  const min = row.items?.min_stock || 10;
                  const isLow = row.quantity <= min;
                  return (
                    <tr key={row.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-mono text-[11px] text-blue-400 font-semibold">
                        {row.items?.sku}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200">
                          {row.items?.name}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {row.items?.category || "Umum"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <div className="flex items-center gap-1.5 text-xs">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{row.locations?.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-white">
                        <span className={isLow ? "text-amber-400 font-bold" : ""}>
                          {row.quantity}
                        </span>{" "}
                        <span className="text-[11px] text-slate-400 font-normal">
                          {row.items?.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400">
                        {min} <span className="text-[10px] text-slate-500">{row.items?.unit}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300 font-mono text-[11px]">
                        Rp {Number(row.items?.unit_cost || 0).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Aman
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION BAR */}
        <div className="p-3 px-4 border-t border-slate-800/80 bg-[#0d1117]/40 flex items-center justify-between text-xs text-slate-400">
          <div>
            Menampilkan{" "}
            <span className="font-medium text-slate-200">
              {filteredStocks.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{" "}
            -{" "}
            <span className="font-medium text-slate-200">
              {Math.min(currentPage * pageSize, filteredStocks.length)}
            </span>{" "}
            dari{" "}
            <span className="font-medium text-slate-200">
              {filteredStocks.length}
            </span>{" "}
            item
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] font-medium text-slate-300">
              Hal {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DETAIL STOK MENIPIS */}
      {showLowStockModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowLowStockModal(false)}
        >
          <div
            className="bg-[#161b22] border border-slate-800 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="p-4 px-5 border-b border-slate-800 flex items-center justify-between bg-[#0d1117]/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Daftar SKU di Bawah Batas Reorder Point
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Total {lowStockItems.length} barang butuh order pengadaan atau alokasi kirim.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLowStockModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-4 overflow-y-auto space-y-2.5 max-h-[60vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {lowStockItems.map((item) => {
                  const sisa = item.quantity;
                  const min = item.items?.min_stock || 10;
                  const unit = item.items?.unit || "unit";
                  const defisit = min - sisa;

                  return (
                    <div
                      key={item.id}
                      className="bg-[#0d1117] border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between gap-2.5"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span className="font-mono text-blue-400 font-semibold">
                            {item.items?.sku}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {item.items?.category}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-slate-200 leading-snug">
                          {item.items?.name}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{item.locations?.name}</span>
                        </div>
                      </div>

                      <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="text-[10px] text-slate-400">Stok Sisa</div>
                          <div className="font-semibold text-amber-400">
                            {sisa} {unit}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400">Target Min.</div>
                          <div className="text-slate-300">
                            {min} {unit}
                          </div>
                        </div>
                      </div>

                      {defisit > 0 && (
                        <div className="text-[10px] text-amber-400/90 font-medium">
                          Defisit: Kurang {defisit} {unit} dari batas aman
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="p-3 px-5 border-t border-slate-800 bg-[#0d1117]/80 flex justify-end">
              <button
                onClick={() => setShowLowStockModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
