import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, KeyRound, Eye, EyeOff, LogIn, CheckCircle2, AlertCircle, X, Lock } from 'lucide-react';

export const LoginModal = ({ isOpen, onClose }) => {
  const { members, loginWithPassword, currentUser } = useApp();

  const [selectedMemberId, setSelectedMemberId] = useState(currentUser?.id || members[0]?.id || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const selectedMember = members.find(m => m.id === selectedMemberId) || members[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!password) {
      setErrorMsg('Masukkan password atau PIN Anda.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = loginWithPassword(selectedMemberId, password);
      setIsSubmitting(false);
      if (res.success) {
        setPassword('');
        if (onClose) onClose();
      } else {
        setErrorMsg(res.message);
      }
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Masuk ke Kita Piket</h3>
              <p className="text-xs text-slate-500">Pilih akun & masukkan password / PIN</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pilih Petugas */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Pilih Petugas Piket:
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {members.map((m) => {
                const isSelected = selectedMemberId === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => {
                      setSelectedMemberId(m.id);
                      setErrorMsg('');
                    }}
                    className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="text-xl">{m.avatar}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate leading-tight">{m.nama}</p>
                      <p className={`text-[10px] font-semibold uppercase tracking-wider ${
                        m.role === 'admin' ? 'text-amber-600' : 'text-slate-500'
                      }`}>
                        {m.role}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Akun Terpilih Summary */}
          {selectedMember && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{selectedMember.avatar}</span>
                <div>
                  <p className="text-xs font-bold text-slate-900">{selectedMember.namaLengkap || selectedMember.nama}</p>
                  <p className="text-[11px] text-slate-500">
                    Role: <span className={`font-bold ${selectedMember.role === 'admin' ? 'text-amber-600' : 'text-blue-600'}`}>
                      {selectedMember.role === 'admin' ? 'Koordinator / Admin (Full Edit)' : 'Staf (Hanya Lihat Jadwal Sendiri)'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Input Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Password atau PIN:</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Default: {selectedMember?.role === 'admin' ? 'admin123' : '123456'} (PIN: 1234)
              </span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password / PIN..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-all"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Memverifikasi...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Masuk Sekarang</span>
              </>
            )}
          </button>
        </form>

        {/* Info Privasi */}
        <p className="text-[11px] text-center text-slate-400">
          💡 Sekali login tetap login di perangkat ini tanpa logout otomatis.
        </p>
      </div>
    </div>
  );
};
