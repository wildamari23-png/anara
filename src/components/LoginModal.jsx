import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Shield, Check } from 'lucide-react';

export const LoginModal = ({ isOpen, onClose }) => {
  const { members, login, currentUser } = useApp();

  if (!isOpen) return null;

  const handleSelect = (member) => {
    login(member);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Pilih Akun Piket</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600">
          Pilih profil Anda di bawah ini. Sesi login akan <strong>tersimpan permanen</strong> di HP ini (Sekali login tetap login).
        </p>

        {/* Member Selector List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {members.map((m) => {
            const isSelected = currentUser?.id === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleSelect(m)}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold shadow-sm'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{m.avatar}</span>
                  <div>
                    <p className="text-xs font-bold leading-tight">
                      {m.namaLengkap || m.nama}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {m.jabatan} • <span className="text-emerald-700 uppercase font-bold">{m.role}</span>
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <span className="p-1 rounded-full bg-emerald-600 text-white shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
