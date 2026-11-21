import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Cloud, User, RefreshCw, Calendar, ShieldCheck, LogOut } from 'lucide-react';

export const Navbar = ({ onOpenNotif, onOpenLogin, onOpenGitHub }) => {
  const { currentUser, logout, unreadCount, isSyncing, syncSupabase } = useApp();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const formattedDate = time.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo & Name (Cerah & Menarik) */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-sky-500 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 to-teal-600">
              KP
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
                Kita Piket
              </h1>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold hidden sm:block">
              {formattedDate} • <span className="font-mono text-emerald-700">{formattedTime}</span>
            </p>
          </div>
        </div>

        {/* Live Clock on Mobile */}
        <div className="sm:hidden font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
          {formattedTime}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Supabase Sync Button */}
          <button
            onClick={syncSupabase}
            disabled={isSyncing}
            title="Sinkronisasi Cloud Supabase"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-emerald-700 transition-all flex items-center gap-1.5 text-xs font-bold"
          >
            {isSyncing ? (
              <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
            ) : (
              <Cloud className="w-4 h-4 text-sky-600" />
            )}
            <span className="hidden md:inline">Supabase</span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotif}
            className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-all"
            aria-label="Pemberitahuan"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Pill (Tetap Login Status) */}
          <button
            onClick={onOpenLogin}
            className={`flex items-center gap-2 p-1.5 pr-3 rounded-2xl border transition-all ${
              currentUser?.role === 'admin'
                ? 'bg-amber-50/80 hover:bg-amber-100 border-amber-200'
                : 'bg-blue-50/80 hover:bg-blue-100 border-blue-200'
            }`}
            title="Klik untuk ganti akun atau profil"
          >
            <div className={`w-7 h-7 rounded-xl text-white flex items-center justify-center text-sm font-bold shadow-sm ${
              currentUser?.role === 'admin' ? 'bg-amber-600' : 'bg-blue-600'
            }`}>
              {currentUser?.avatar || '👤'}
            </div>
            <div className="text-left hidden xs:block">
              <p className="text-xs font-bold text-slate-900 leading-tight">
                {currentUser ? currentUser.nama : 'Masuk'}
              </p>
              <p className={`text-[10px] font-bold capitalize flex items-center gap-0.5 ${
                currentUser?.role === 'admin' ? 'text-amber-700' : 'text-blue-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  currentUser?.role === 'admin' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                {currentUser?.role === 'admin' ? 'Admin' : 'Staf (Lihat Saja)'}
              </p>
            </div>
          </button>

          {/* Logout Button */}
          {currentUser && (
            <button
              onClick={logout}
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 text-slate-500 hover:text-rose-600 transition-all"
              title="Keluar / Ganti Akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
