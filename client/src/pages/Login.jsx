import React, { useState } from "react";
import { apiRequest } from "../lib/api";
import { Layers, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message || "Gagal masuk ke sistem.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = (e) => {
    const val = e.target.value;
    if (val === "admin") {
      setUsername("admin");
      setPassword("admin123");
    } else if (val === "gudang") {
      setUsername("gudang");
      setPassword("gudang123");
    } else if (val === "pamulang") {
      setUsername("pamulang");
      setPassword("pamulang123");
    } else if (val === "bsd") {
      setUsername("bsd");
      setPassword("bsd123");
    } else if (val === "bintaro") {
      setUsername("bintaro");
      setPassword("bintaro123");
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col justify-between p-4 sm:p-8 text-slate-200 antialiased selection:bg-blue-600 selection:text-white">
      {/* TOP BRANDING */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-blue-500/20">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-semibold text-white tracking-tight">
            SupplyChain<span className="text-blue-400">Ku</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Server SCM v1.0 • Supabase Cloud</span>
        </div>
      </div>

      {/* LOGIN CARD */}
      <div className="max-w-md w-full mx-auto my-8">
        <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-white tracking-tight">
              Masuk ke Portal Operasional
            </h1>
            <p className="text-xs text-slate-400">
              Gunakan kredensial akun SCM Anda untuk mengakses data rantai pasok.
            </p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3 rounded-lg text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Username Pengguna
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin / gudang / pamulang"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-200 text-xs outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-200 text-xs outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition shadow-sm shadow-blue-600/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <span>{loading ? "Memverifikasi Kredensial..." : "Masuk ke Sistem"}</span>
              {!loading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>

          {/* DEMO ACCORDION PICKER */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <label className="block text-[11px] font-medium text-slate-400">
              Pilih Cepat Akun Demo (Simulasi Pengujian):
            </label>
            <select
              onChange={handleDemoSelect}
              defaultValue="admin"
              className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-300 text-xs outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="admin">Palaguna (Manajer Pusat - Full Access)</option>
              <option value="gudang">Putra Reno (Kepala Gudang Pusat)</option>
              <option value="pamulang">Ikhsan Dwi (Branch Mgr - Cabang Pamulang)</option>
              <option value="bsd">Dedi Kurniawan (Branch Mgr - Cabang BSD)</option>
              <option value="bintaro">Rina Anggraini (Branch Mgr - Cabang Bintaro)</option>
            </select>
            <p className="text-[10px] text-slate-500 text-center pt-1">
              Setiap peran memiliki hak akses berbeda sesuai hierarki logistik.
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="max-w-7xl w-full mx-auto text-center space-y-1.5 text-xs text-slate-500 pb-2">
        <div>
          &copy; 2026 <span className="text-slate-400 font-medium">SupplyChainKu</span> — Enterprise Logistics & Supply Chain System.
        </div>
        <div className="text-[11px] text-slate-400 flex items-center justify-center gap-2 flex-wrap">
          <span className="text-slate-500">Tim Pengembang:</span>
          <span className="text-slate-300 font-medium">Palaguna</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300 font-medium">Putra Reno Hariyanto</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300 font-medium">Ikhsan Dwi Saputra</span>
        </div>
      </footer>
    </div>
  );
};

export default Login;
