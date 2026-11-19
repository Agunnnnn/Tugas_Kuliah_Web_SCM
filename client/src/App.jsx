import React, { useState, useEffect, useMemo, useRef } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import InboundOrders from "./pages/InboundOrders";
import Distributions from "./pages/Distributions";
import MasterData from "./pages/MasterData";
import StockMovements from "./pages/StockMovements";
import { apiRequest } from "./lib/api";
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
  ChevronDown,
  Command,
  Plus,
  Shield,
  Sparkles,
  ExternalLink,
  SlidersHorizontal,
  AlertTriangle,
  ArrowUpRight,
  UserCheck,
  RefreshCw,
} from "lucide-react";

const App = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  // Interactive UI state
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [searchPaletteQuery, setSearchPaletteQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [badgeData, setBadgeData] = useState({ lowStock: 0, activeDist: 0 });

  const notifRef = useRef(null);
  const userRef = useRef(null);
  const actionRef = useRef(null);

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
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch live stats for badges
  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      try {
        const q =
          user.role === "branch_manager"
            ? `?location_id=${user.location_id}&role=${user.role}`
            : `?role=${user.role}`;
        const res = await apiRequest(`/dashboard${q}`);
        if (res?.stats) {
          setBadgeData({
            lowStock: res.stats.lowStockCount || 0,
            activeDist: res.stats.activeDistributions || 0,
          });
        }
      } catch (err) {
        // silent fail
      }
    };
    fetchStats();
    const timer = setInterval(fetchStats, 30000);
    return () => clearInterval(timer);
  }, [user, activeTab]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (actionRef.current && !actionRef.current.contains(e.target)) {
        setQuickActionOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem("scm_user_session", JSON.stringify(userData));
    setUser(userData);
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("scm_user_session");
    setUser(null);
    setUserDropdownOpen(false);
  };

  const handleSwitchAccount = async (targetUsername) => {
    try {
      const passwords = {
        admin: "admin123",
        gudang: "gudang123",
        pamulang: "pamulang123",
        bsd: "bsd123",
        bintaro: "bintaro123",
      };
      const res = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: targetUsername,
          password: passwords[targetUsername] || "admin123",
        }),
      });
      if (res?.user) {
        handleLoginSuccess(res.user);
        setUserDropdownOpen(false);
      }
    } catch (e) {
      alert("Gagal beralih akun: " + e.message);
    }
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Grouped Navigation structure
  const navSections = [
    {
      title: "INVENTARIS & AUDIT",
      items: [
        {
          id: "dashboard",
          label: "Monitoring Stok",
          badge: badgeData.lowStock > 0 ? `${badgeData.lowStock} Kritis` : null,
          badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
          icon: LayoutDashboard,
          roles: ["super_admin", "warehouse_staff", "branch_manager"],
        },
        {
          id: "movements",
          label: "Buku Mutasi Stok",
          icon: History,
          roles: ["super_admin", "warehouse_staff", "branch_manager"],
        },
      ],
    },
    {
      title: "ALIRAN LOGISTIK",
      items: [
        {
          id: "inbound",
          label: "Pengadaan (Inbound)",
          icon: ArrowDownToLine,
          roles: ["super_admin", "warehouse_staff"],
        },
        {
          id: "distributions",
          label: "Distribusi Cabang",
          badge:
            badgeData.activeDist > 0 ? `${badgeData.activeDist} Aktif` : null,
          badgeColor: "bg-sky-500/15 text-sky-300 border-sky-500/30",
          icon: Truck,
          roles: ["super_admin", "warehouse_staff", "branch_manager"],
        },
      ],
    },
    {
      title: "PENGATURAN DATA",
      items: [
        {
          id: "master",
          label: "Master SKU & Vendor",
          icon: Database,
          roles: ["super_admin", "warehouse_staff"],
        },
      ],
    },
  ];

  const roleLabel =
    {
      super_admin: "Manajer Pusat",
      warehouse_staff: "Staf Gudang Pusat",
      branch_manager: "Kepala Cabang",
    }[user.role] || user.role;

  const userInitials = (user.name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Command palette searchable options
  const paletteItems = [
    {
      id: "dashboard",
      title: "Monitoring Stok",
      section: "Halaman",
      shortcut: "G D",
    },
    {
      id: "movements",
      title: "Buku Mutasi Stok",
      section: "Halaman",
      shortcut: "G M",
    },
    {
      id: "inbound",
      title: "Pengadaan (Inbound PO)",
      section: "Halaman",
      shortcut: "G I",
    },
    {
      id: "distributions",
      title: "Distribusi Cabang (DO)",
      section: "Halaman",
      shortcut: "G T",
    },
    {
      id: "master",
      title: "Master SKU & Supplier",
      section: "Halaman",
      shortcut: "G S",
    },
  ];

  const filteredPalette = paletteItems.filter((item) =>
    item.title.toLowerCase().includes(searchPaletteQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-200 flex flex-col md:flex-row font-sans selection:bg-blue-600 selection:text-white antialiased">
      {/* ========================================================================= */}
      {/* 1. PROFESSIONAL SIDEBAR NAVIGATION (DESKTOP)                              */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex flex-col w-64 bg-[#111622] border-r border-slate-800/80 shrink-0 select-none z-20">
        {/* BRAND / WORKSPACE HEADER */}
        <div className="p-3.5 border-b border-slate-800/80">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[#0b0f17] border border-slate-800/90 hover:border-slate-700/80 transition group">
            <div className="w-9 h-9 rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>SupplyChainKu</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate">
                  {user.locations?.name || "Gudang Pusat"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK SEARCH BUTTON (CMD + K TRIGGER) */}
        <div className="px-3 pt-3">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full px-3 py-2 rounded-lg bg-[#0b0f17] hover:bg-slate-800/50 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs flex items-center justify-between transition cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition" />
              <span>Cari cepat menu...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700 rounded">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* NAVIGATION GROUPS */}
        <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {navSections.map((section, sIdx) => {
            const availableItems = section.items.filter((item) =>
              item.roles.includes(user.role),
            );
            if (availableItems.length === 0) return null;

            return (
              <div key={sIdx} className="space-y-1">
                <div className="px-2.5 pb-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase flex items-center justify-between">
                  <span>{section.title}</span>
                </div>

                {availableItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition text-left cursor-pointer group relative ${
                        isActive
                          ? "bg-linear-to-r from-blue-600/15 via-blue-600/10 to-transparent text-white border-l-2 border-blue-500 pl-2.5"
                          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border-l-2 border-transparent pl-2.5"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition ${
                            isActive
                              ? "text-blue-400 scale-105"
                              : "text-slate-500 group-hover:text-slate-300"
                          }`}
                        />
                        <span
                          className={`truncate ${isActive ? "font-semibold text-white" : ""}`}
                        >
                          {item.label}
                        </span>
                      </div>

                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* SYSTEM STATUS PILL IN SIDEBAR */}
        <div className="px-4 py-2 border-t border-slate-800/60 bg-[#0d121c]/40">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>PostgreSQL Cloud</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">v1.2</span>
          </div>
        </div>

        {/* USER PROFILE CARD WITH QUICK SWITCHER */}
        <div
          className="p-3 border-t border-slate-800/80 bg-[#111622] relative"
          ref={userRef}
        >
          <div
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center justify-between p-2 rounded-xl bg-[#0b0f17] border border-slate-800 hover:border-slate-700 cursor-pointer transition select-none group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-700 to-indigo-800 border border-blue-500/30 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-inner">
                {userInitials}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-200 truncate group-hover:text-white transition leading-tight">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  <span>{roleLabel}</span>
                </div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition" />
          </div>

          {/* USER PROFILE POPOVER */}
          {userDropdownOpen && (
            <div className="absolute bottom-16 left-3 right-3 bg-[#161b26] border border-slate-700 rounded-xl shadow-2xl p-2.5 space-y-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1.5 border-b border-slate-800 text-[11px]">
                <div className="text-slate-400">Masuk sebagai:</div>
                <div className="font-bold text-white truncate">{user.name}</div>
                <div className="text-[10px] text-blue-400">
                  {user.locations?.name || "Kantor Pusat"}
                </div>
              </div>

              <div className="space-y-1">
                <div className="px-2 pt-1 text-[10px] font-bold text-slate-500 uppercase">
                  Beralih Akun (Simulasi Demo):
                </div>
                {[
                  {
                    user: "admin",
                    name: "Palaguna (Pusat)",
                    role: "Manajer Pusat",
                  },
                  {
                    user: "gudang",
                    name: "Putra Reno (Gudang)",
                    role: "Staf Gudang",
                  },
                  {
                    user: "pamulang",
                    name: "Ikhsan Dwi (Pamulang)",
                    role: "Kepala Cabang",
                  },
                  { user: "bsd", name: "Dedi (BSD)", role: "Kepala Cabang" },
                ].map((acc) => (
                  <button
                    key={acc.user}
                    onClick={() => handleSwitchAccount(acc.user)}
                    className="w-full px-2 py-1.5 rounded-lg text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-between cursor-pointer transition"
                  >
                    <span className="truncate">{acc.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {acc.role}
                    </span>
                  </button>
                ))}
              </div>

              <div className="pt-1.5 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full px-2 py-1.5 rounded-lg text-left text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-1.5 cursor-pointer transition font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar dari Sesi</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE TOPBAR & DRAWER                                                 */}
      {/* ========================================================================= */}
      <header className="md:hidden bg-[#111622] border-b border-slate-800 px-4 h-14 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-sm text-white">SupplyChainKu</span>
            <span className="block text-[10px] text-slate-400 leading-none">
              {user.locations?.name || "Pusat"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      {/* MOBILE DROPDOWN ACCORDION */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#161b26] border-b border-slate-800 p-3 space-y-2 z-30">
          {navSections.map((sec, i) => (
            <div key={i} className="space-y-1">
              <div className="px-2 text-[10px] font-bold text-slate-500 uppercase">
                {sec.title}
              </div>
              {sec.items
                .filter((item) => item.roles.includes(user.role))
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          ))}

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between px-2 text-xs">
            <span className="text-slate-300 font-medium">
              {user.name} ({roleLabel})
            </span>
            <button
              onClick={handleLogout}
              className="text-rose-400 font-bold flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" /> Keluar
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MAIN WORKSPACE AREA WITH LUXURY TOPBAR                                 */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* TOP STATUS BAR (DESKTOP) */}
        <header className="hidden md:flex h-14 border-b border-slate-800/80 bg-[#111622]/60 backdrop-blur-md px-6 lg:px-8 items-center justify-between sticky top-0 z-30">
          {/* BREADCRUMB / VIEW TITLE */}
          <div className="flex items-center gap-2.5 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Operasional SCM</span>
            </div>
            <span className="text-slate-600">/</span>
            <span className="text-white font-semibold flex items-center gap-1.5">
              {
                navSections
                  .flatMap((s) => s.items)
                  .find((n) => n.id === activeTab)?.label
              }
            </span>
          </div>

          {/* RIGHT UTILITIES */}
          <div className="flex items-center gap-3">
            {/* QUICK ACTIONS BUTTON */}
            {user.role !== "branch_manager" && (
              <div className="relative" ref={actionRef}>
                <button
                  onClick={() => setQuickActionOpen(!quickActionOpen)}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Aksi Cepat</span>
                  <ChevronDown className="w-3 h-3 text-blue-400" />
                </button>

                {quickActionOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#161b26] border border-slate-700 rounded-xl shadow-2xl p-1.5 text-xs z-50 animate-in fade-in">
                    <button
                      onClick={() => {
                        setActiveTab("inbound");
                        setQuickActionOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5 text-blue-400" />
                      <span>Order Pengadaan (PO)</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("distributions");
                        setQuickActionOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5 text-sky-400" />
                      <span>Surat Jalan Kirim (DO)</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("master");
                        setQuickActionOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer"
                    >
                      <Database className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Tambah SKU / Supplier</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* NOTIFICATION CENTER */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-8 h-8 rounded-lg bg-[#0b0f17] hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition cursor-pointer relative"
                title="Pemberitahuan Sistem"
              >
                <Bell className="w-4 h-4" />
                {badgeData.lowStock > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1.5 right-1.5 ring-2 ring-[#0b0f17]"></span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#161b26] border border-slate-700 rounded-xl shadow-2xl p-3 text-xs z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-bold text-white">
                      Notifikasi Logistik
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Live Updates
                    </span>
                  </div>

                  <div className="py-2 space-y-2">
                    {badgeData.lowStock > 0 ? (
                      <div
                        onClick={() => {
                          setActiveTab("dashboard");
                          setNotificationsOpen(false);
                        }}
                        className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 cursor-pointer hover:bg-amber-500/15 transition flex items-start gap-2"
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-xs">
                            Peringatan Reorder Point
                          </div>
                          <div className="text-[11px] text-amber-300/80">
                            Ada {badgeData.lowStock} item stok kritis di bawah
                            batas minimum.
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 text-center text-slate-400 text-xs">
                        Semua saldo stok terpantau aman.
                      </div>
                    )}

                    <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-800 text-slate-300 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-xs text-white">
                          Sinkronisasi Cloud Aktif
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Data terhubung otomatis ke PostgreSQL Supabase.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* DATE BADGE */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0b0f17] border border-slate-800 text-[11px] font-mono text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>{currentTime}</span>
            </div>
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
        <footer className="mt-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-slate-800/80 bg-[#111622]/40 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="font-semibold text-slate-200">
                SupplyChainKu
              </span>
              <span className="text-slate-600">•</span>
              <span>Sistem Manajemen Rantai Pasok Terintegrasi</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-center text-[11px] text-slate-400">
              <span className="text-slate-500">Tim Pengembang:</span>
              <span className="font-medium text-slate-300">Palaguna</span>
              <span className="text-slate-600">•</span>
              <span className="font-medium text-slate-300">
                Putra Reno Hariyanto
              </span>
              <span className="text-slate-600">•</span>
              <span className="font-medium text-slate-300">
                Ikhsan Dwi Saputra
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* ========================================================================= */}
      {/* 4. GLOBAL COMMAND PALETTE (CMD + K / CTRL + K)                            */}
      {/* ========================================================================= */}
      {commandPaletteOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150"
          onClick={() => setCommandPaletteOpen(false)}
        >
          <div
            className="bg-[#161b26] border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 px-4 border-b border-slate-800 flex items-center gap-3">
              <Search className="w-4 h-4 text-blue-400" />
              <input
                type="text"
                autoFocus
                placeholder="Ketik nama menu, halaman, atau aksi..."
                value={searchPaletteQuery}
                onChange={(e) => setSearchPaletteQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded">
                ESC
              </kbd>
            </div>

            <div className="p-2 max-h-72 overflow-y-auto">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase">
                Navigasi Cepat
              </div>
              {filteredPalette.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  Tidak ditemukan perintah yang cocok.
                </div>
              ) : (
                filteredPalette.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setCommandPaletteOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs text-slate-200 hover:bg-blue-600/20 hover:text-white flex items-center justify-between cursor-pointer transition"
                  >
                    <span className="font-medium">{item.title}</span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      {item.shortcut}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
