import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  X,
  Trash2,
  Lock,
  UserCheck,
  Building
} from 'lucide-react';

const AVATAR_OPTIONS = ['👨‍⚕️', '👩‍⚕️', '🧑‍⚕️', '👨‍💼', '👩‍💼', '👮‍♂️', '🩺', '💉', '🏥', '⭐️'];

export const MemberEditModal = ({ isOpen, onClose, member = null, mode = 'edit' }) => {
  const { locations, addMember, updateMember, deleteMember, currentUser } = useApp();

  const [form, setForm] = useState({
    nama: '',
    namaLengkap: '',
    jabatan: 'Petugas Piket',
    role: 'staf',
    avatar: '👨‍⚕️',
    noHp: '',
    email: '',
    password: '123456',
    pin: '1234',
    assignedLocations: []
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (member && mode === 'edit') {
      setForm({
        nama: member.nama || '',
        namaLengkap: member.namaLengkap || member.nama || '',
        jabatan: member.jabatan || 'Petugas Piket',
        role: member.role || 'staf',
        avatar: member.avatar || '👨‍⚕️',
        noHp: member.noHp || '',
        email: member.email || '',
        password: member.password || (member.role === 'admin' ? 'admin123' : '123456'),
        pin: member.pin || '1234',
        assignedLocations: member.assignedLocations || []
      });
    } else {
      setForm({
        nama: '',
        namaLengkap: '',
        jabatan: 'Petugas Piket',
        role: 'staf',
        avatar: '👨‍⚕️',
        noHp: '',
        email: '',
        password: '123456',
        pin: '1234',
        assignedLocations: locations.length > 0 ? [locations[0].id] : []
      });
    }
    setErrorMsg('');
  }, [member, mode, isOpen, locations]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.nama.trim()) {
      setErrorMsg('Nama panggilan / nama petugas wajib diisi.');
      return;
    }

    if (form.assignedLocations.length === 0) {
      setErrorMsg('Pilih minimal 1 pos penempatan tugas untuk petugas ini.');
      return;
    }

    if (mode === 'create') {
      addMember(form);
    } else if (mode === 'edit' && member) {
      updateMember(member.id, form);
    }

    if (onClose) onClose();
  };

  const handleDelete = () => {
    if (!member) return;
    if (member.id === currentUser?.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.');
      return;
    }
    if (confirm(`Yakin ingin menghapus petugas "${member.nama}"? Data riwayat dinas akun ini akan dihapus.`)) {
      deleteMember(member.id);
      if (onClose) onClose();
    }
  };

  const handleToggleLoc = (locId) => {
    setForm(prev => {
      const exists = prev.assignedLocations.includes(locId);
      return {
        ...prev,
        assignedLocations: exists
          ? prev.assignedLocations.filter(id => id !== locId)
          : [...prev.assignedLocations, locId]
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 animate-scale-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {mode === 'create' ? 'Tambah Petugas Baru' : `Edit Profil: ${member?.nama}`}
              </h3>
              <p className="text-xs text-slate-500">
                Atur nama tampilan di jadwal, hak akses, password, dan pos dinas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 1. Pilih Avatar Emoji */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Pilih Ikon Avatar:</label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => setForm({ ...form, avatar: av })}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                    form.avatar === av
                      ? 'bg-emerald-100 border-2 border-emerald-600 scale-110 shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Nama Panggilan & Nama Lengkap */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nama Panggilan (Di Jadwal):*
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Fadil, Awa, Bagas"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Nama pendek yang tampil di tabel & kalender</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nama Lengkap & Gelar:
              </label>
              <input
                type="text"
                placeholder="Contoh: M. Fadilah A., S.Kep"
                value={form.namaLengkap}
                onChange={(e) => setForm({ ...form, namaLengkap: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Nama resmi untuk laporan dinas</span>
            </div>
          </div>

          {/* 3. Jabatan & Hak Akses (Role) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jabatan / Profesi:</label>
              <input
                type="text"
                placeholder="Contoh: Petugas Piket, Koordinator"
                value={form.jabatan}
                onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Hak Akses (Role):</label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'staf' })}
                  className={`py-1.5 px-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                    form.role === 'staf'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Staf (Lihat)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'admin' })}
                  className={`py-1.5 px-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                    form.role === 'admin'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin (Full)</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4. Kontak (No HP / WhatsApp & Email) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                No. HP / WhatsApp:
              </label>
              <input
                type="tel"
                placeholder="Contoh: 081234567890"
                value={form.noHp}
                onChange={(e) => setForm({ ...form, noHp: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email:
              </label>
              <input
                type="email"
                placeholder="petugas@kitapiket.id"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* 5. Password & PIN Keamanan Akun */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                Kredensial Login Akun:
              </label>
              <span className="text-[10px] text-slate-400">
                Default: {form.role === 'admin' ? 'admin123' : '123456'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Password Login:*</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2 pr-9 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">PIN Cadangan (4 Digit):</label>
                <input
                  type="text"
                  maxLength="6"
                  value={form.pin}
                  onChange={(e) => setForm({ ...form, pin: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-center font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* 6. Penempatan Pos Lokasi Tugas */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="block font-bold text-slate-700 flex items-center justify-between">
              <span>Pos Lokasi Penugasan ({form.assignedLocations.length} terpilih):</span>
              <span className="text-[10px] text-slate-400 font-normal">Bisa pilih lebih dari satu</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              {locations.map(loc => {
                const isChecked = form.assignedLocations.includes(loc.id);
                return (
                  <button
                    type="button"
                    key={loc.id}
                    onClick={() => handleToggleLoc(loc.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isChecked
                        ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-950 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: loc.warna || '#10b981' }}
                      />
                      <span className="truncate">{loc.nama}</span>
                    </div>
                    {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            {mode === 'edit' && member && member.id !== currentUser?.id ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Petugas</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{mode === 'create' ? 'Daftarkan Petugas' : 'Simpan Profil'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
