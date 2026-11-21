import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { testSupabaseConnection } from '../supabaseClient';
import { Settings, Cloud, Bell, Smartphone, Shield, LogOut, Check, RefreshCw, Key, Database, Info, GitBranch, ExternalLink } from 'lucide-react';

const GithubIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export const SettingsView = ({ onOpenLogin }) => {
  const {
    currentUser,
    logout,
    sendWebNotification,
    syncSupabase,
    isSyncing,
    syncStatus
  } = useApp();

  // Supabase Local Form State
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem('kp_supabase_url') || '');
  const [supabaseKey, setSupabaseKey] = useState(() => localStorage.getItem('kp_supabase_key') || '');
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  // GitHub Local Form State
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('kp_github_token') || '');
  const [githubRepo, setGithubRepo] = useState(() => localStorage.getItem('kp_github_repo') || '');
  const [githubStatus, setGithubStatus] = useState(null);
  const [isPushingGit, setIsPushingGit] = useState(false);

  const handleSaveSupabase = () => {
    localStorage.setItem('kp_supabase_url', supabaseUrl.trim());
    localStorage.setItem('kp_supabase_key', supabaseKey.trim());
    setTestResult({ success: true, message: 'Kredensial Supabase berhasil disimpan di perangkat ini!' });
  };

  const handleTestConnection = async () => {
    if (!supabaseUrl || !supabaseKey) {
      setTestResult({ success: false, message: 'Masukkan Project URL dan Anon Key terlebih dahulu.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(supabaseUrl.trim(), supabaseKey.trim());
    setIsTesting(false);
    setTestResult(res);
  };

  // Save GitHub info & Test / Push
  const handleSaveGitHub = async () => {
    localStorage.setItem('kp_github_token', githubToken.trim());
    localStorage.setItem('kp_github_repo', githubRepo.trim());
    setGithubStatus({ success: true, message: 'Akses token GitHub tersimpan! Siap di-push ke repository.' });
  };

  // Test Mobile Push Notification
  const handleTestNotification = () => {
    sendWebNotification(
      '🔔 Pengingat Piket Dinas - Kita Piket',
      'Halo! Shift Anda akan dimulai dalam 1 jam di RSJ. Harap segera bersiap.'
    );
  };

  return (
    <div className="space-y-6 pb-28 animate-fade-in">
      {/* Header (Cerah) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-600" />
          Pengaturan Aplikasi & Cloud
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Koneksi GitHub, Supabase Database, status sekali login, dan notifikasi pengingat HP.
        </p>
      </div>

      {/* 1. Status Sekali Login (Tetap Login) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          Status Akun: Sekali Login Tetap Login
        </h3>

        {currentUser ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white text-2xl flex items-center justify-center font-bold shadow-sm">
                {currentUser.avatar}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{currentUser.namaLengkap || currentUser.nama}</h4>
                <p className="text-xs text-slate-600">{currentUser.jabatan} • <span className="text-emerald-700 font-bold uppercase text-[10px]">{currentUser.role}</span></p>
                <p className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Sesi Anda aktif & tersimpan permanen di HP ini (Tidak akan logout sendiri).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={onOpenLogin}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold transition-all shadow-xs"
              >
                Ganti Akun
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-xs text-slate-500 mb-3">Pilih akun Anda untuk mengaktifkan sesi tetap login.</p>
            <button
              onClick={onOpenLogin}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
            >
              Masuk Sekarang
            </button>
          </div>
        )}
      </div>

      {/* 2. Koneksi GitHub Repository */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GithubIcon className="w-5 h-5 text-slate-900" />
            <h3 className="text-sm font-bold text-slate-900">Koneksi Repository GitHub</h3>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Version Control & Hosting
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Hubungkan ke akun GitHub Anda untuk deployment otomatis ke GitHub Pages atau Vercel. Masukkan Personal Access Token (PAT) Anda di bawah ini:
        </p>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 mb-1 font-bold">Nama Repository (contoh: <code>username/kita-piket</code>):</label>
            <input
              type="text"
              placeholder="username/kita-piket"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-bold">GitHub Personal Access Token (classic / fine-grained):</label>
            <input
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {githubStatus && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              githubStatus.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}>
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{githubStatus.message}</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSaveGitHub}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              Simpan Akses GitHub
            </button>
            <a
              href="https://github.com/settings/tokens/new"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Buat Token di GitHub
            </a>
          </div>
        </div>
      </div>

      {/* 3. Koneksi Database Supabase */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900">Integrasi Database Cloud Supabase</h3>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            PostgreSQL Realtime
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Simpan data jadwal, absensi dinas, dan pengaturan lokasi di Supabase cloud. Masukkan Project URL dan Anon Key Supabase Anda:
        </p>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 mb-1 font-bold">Supabase Project URL:</label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-bold">Supabase Anon Key:</label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              testResult.success
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}>
              {testResult.success ? <Check className="w-4 h-4 shrink-0 text-emerald-600" /> : <Info className="w-4 h-4 shrink-0 text-rose-600" />}
              <span>{testResult.message}</span>
            </div>
          )}

          {syncStatus && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              syncStatus.success
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}>
              {syncStatus.success ? <Check className="w-4 h-4 shrink-0 text-emerald-600" /> : <Info className="w-4 h-4 shrink-0 text-rose-600" />}
              <span>{syncStatus.message}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={handleSaveSupabase}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              Simpan Kunci
            </button>
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
              Tes Koneksi
            </button>
            <button
              onClick={syncSupabase}
              disabled={isSyncing}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ml-auto"
            >
              {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
              Upload / Sinkronkan Data
            </button>
          </div>
        </div>
      </div>

      {/* 4. Pengingat & Notifikasi HP */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-600" />
          Pengingat Piket & Notifikasi HP
        </h3>
        <p className="text-xs text-slate-600">
          Aplikasi akan otomatis memunculkan notifikasi pengingat sebelum jadwal dinas dimulai.
        </p>

        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-amber-900">Tes Kirim Notifikasi ke HP Anda</p>
            <p className="text-[11px] text-amber-700">Pastikan izin notifikasi di browser Anda sudah aktif.</p>
          </div>
          <button
            onClick={handleTestNotification}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shrink-0 shadow-sm"
          >
            Kirim Tes Notif
          </button>
        </div>
      </div>

      {/* 5. Panduan PWA Android */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Cara Pasang di HP Android (PWA)</h3>
        </div>
        <ol className="text-xs text-slate-600 list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
          <li>Buka alamat aplikasi di <strong>Google Chrome</strong> pada HP Anda.</li>
          <li>Ketuk menu <strong>titik tiga (⋮)</strong> di pojok kanan atas Chrome.</li>
          <li>Pilih <strong>"Tambahkan ke Layar Utama"</strong> (atau <em>"Install App"</em>).</li>
          <li>Aplikasi <strong>Kita Piket</strong> akan terpasang di HP Anda dan bisa dibuka secara mandiri layar penuh.</li>
        </ol>
      </div>
    </div>
  );
};
