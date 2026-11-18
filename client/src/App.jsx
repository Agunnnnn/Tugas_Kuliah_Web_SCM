import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import InboundOrders from "./pages/InboundOrders";
import Distributions from "./pages/Distributions";
import MasterData from "./pages/MasterData";
import StockMovements from "./pages/StockMovements";
import {
  LayoutDashboard,
  ArrowDownToLine,
  Truck,
  Database,
  History,
  LogOut,
  MapPin,
  Menu,
  X,
  Layers,
  Building2,
  Bell,
  Search,
  CheckCircle2,
} from "lucide-react";

const App = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("scm_user_session");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem("scm_user_session");
      }
    }
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("id-ID", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem("scm_user_session", JSON.stringify(userData));
    setUser(userData);
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("scm_user_session");
    setUser(null);
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const navItems = [
    {
      id: "dashboard",
      label: "Monitoring Stok",
      desc: "Ringkasan & inventaris real-time",
      icon: LayoutDashboard,
      roles: ["super_admin", "warehouse_staff", "branch_manager"],
    },
    {
      id: "inbound",
      label: "Pengadaan (Inbound)",
      desc: "Purchase order dari vendor",
      icon: ArrowDownToLine,
      roles: ["super_admin", "warehouse_staff"],
    },
    {
      id: "distributions",
      label: "Distribusi Cabang",
      desc: "Surat jalan & pengiriman toko",
      icon: Truck,
      roles: ["super_admin", "warehouse_staff", "branch_manager"],
    },
    {
      id: "movements",
      label: "Buku Mutasi Stok",
      desc: "Audit trail log masuk & keluar",
      icon: History,
      roles: ["super_admin", "warehouse_staff", "branch_manager"],
    },
    {
      id: "master",
      label: "Master Data",
      desc: "Katalog SKU & daftar supplier",
      icon: Database,
      roles: ["super_admin", "warehouse_staff"],
    },
  ].filter((item) => item.roles.includes(user.role));

  const roleLabel = {
    super_admin: "Manajer Pusat",
    warehouse_staff: "Staf Pergudangan",
    branch_manager: "Kepala Cabang",
  }[user.role] || user.role;

  const userInitials = (user.name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-200 flex flex-col md:flex-row font-sans selection:bg-blue-600 selection:text-white antialiased">
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 bg-[#161b22] border-r border-slate-800/80 shrink-0 select-none">
        {/* LOGO & ORG */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-blue-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white tracking-tight leading-none">
                SupplyChain<span className="text-blue-400">Ku</span>
              </div>
              <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                Sistem Logistik F&B
              </div>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            PROD
          </span>
        </div>

        {/* WORKSPACE CONTEXT */}
        <div className="px-4 py-3 mx-3 mt-3 rounded-lg bg-[#0d1117] border border-slate-800 flex items-center gap-2.5">
          <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Lokasi Aktif
            </div>
            <div className="text-xs font-medium text-slate-200 truncate">
              {user.locations?.name || "Semua Lokasi"}
            </div>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-2 pb-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
            Menu Operasional
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition text-left cursor-pointer group ${
                  isActive
                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition ${
                    isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className={`truncate ${isActive ? "font-semibold text-white" : ""}`}>
                    {item.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* USER PROFILE & LOGOUT FOOTER */}
        <div className="p-3 border-t border-slate-800/80 bg-[#161b22]">
          <div className="flex items-center justify-between p-2 rounded-lg bg-[#0d1117] border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-900/60 border border-blue-700/50 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                {userInitials}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-slate-200 truncate leading-tight">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {roleLabel}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Keluar dari sesi"
              className="p-1.5 rounded-md hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden bg-[#161b22] border-b border-slate-800 px-4 h-14 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-sm text-white">SupplyChainKu</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* MOBILE DROPDOWN MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#161b22] border-b border-slate-800 p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-left ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between px-2">
            <span className="text-xs text-slate-400">{user.name}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-red-400 hover:underline flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" /> Keluar
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* TOP STATUS BAR (DESKTOP) */}
        <header className="hidden md:flex h-14 border-b border-slate-800/80 bg-[#161b22]/50 backdrop-blur px-8 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Operasional SCM</span>
            <span>/</span>
            <span className="text-slate-200 font-medium">
              {navItems.find((n) => n.id === activeTab)?.label}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px]">Database Cloud Terhubung</span>
            </div>
            <span className="text-slate-700">|</span>
            <span className="text-[11px] text-slate-400 font-mono">{currentTime}</span>
          </div>
        </header>

        {/* CONTENT CONTAINER */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === "dashboard" && <Dashboard user={user} />}
          {activeTab === "inbound" && <InboundOrders user={user} />}
          {activeTab === "distributions" && <Distributions user={user} />}
          {activeTab === "movements" && <StockMovements user={user} />}
          {activeTab === "master" && <MasterData user={user} />}
        </main>

        {/* FOOTER */}
        <footer className="mt-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-slate-800/80 bg-[#161b22]/40 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="font-semibold text-slate-200">SupplyChainKu</span>
              <span className="text-slate-600">•</span>
              <span>Sistem Manajemen Rantai Pasok Terintegrasi</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-center text-[11px] text-slate-400">
              <span className="text-slate-500">Tim Pengembang:</span>
              <span className="font-medium text-slate-300">Palaguna</span>
              <span className="text-slate-600">•</span>
              <span className="font-medium text-slate-300">Putra Reno Hariyanto</span>
              <span className="text-slate-600">•</span>
              <span className="font-medium text-slate-300">Ikhsan Dwi Saputra</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
