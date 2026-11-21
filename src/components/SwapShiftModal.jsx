import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, ArrowLeftRight, Check } from 'lucide-react';

export const SwapShiftModal = ({ isOpen, onClose }) => {
  const { currentUser, members, locations, sendWebNotification } = useApp();
  const [targetMember, setTargetMember] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().getDate());
  const [targetLocation, setTargetLocation] = useState(locations[0]?.id || '');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetMember) return;

    const partner = members.find(m => m.id === targetMember);
    const loc = locations.find(l => l.id === targetLocation);

    sendWebNotification(
      'Permintaan Tukar Shift Diajukan 🔄',
      `${currentUser?.nama || 'Petugas'} mengajukan tukar piket kepada ${partner?.nama} pada tanggal ${targetDate} di ${loc?.nama}.`
    );

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Ajukan Tukar Piket Dinas</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Permintaan Berhasil Dikirim!</h4>
            <p className="text-xs text-slate-500">
              Notifikasi telah dikirim ke rekan dinas dan koordinator untuk persetujuan.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 mb-1 font-bold">Petugas Pengganti (Tukar Dengan):</label>
              <select
                required
                value={targetMember}
                onChange={(e) => setTargetMember(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Pilih Rekan Petugas --</option>
                {members.filter(m => m.id !== currentUser?.id).map(m => (
                  <option key={m.id} value={m.id}>{m.namaLengkap || m.nama} ({m.jabatan})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Tanggal Piket:</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={targetDate}
                  onChange={(e) => setTargetDate(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Pos Lokasi:</label>
                <select
                  value={targetLocation}
                  onChange={(e) => setTargetLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
                >
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>{l.nama}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-bold">Alasan Tukar Dinas:</label>
              <textarea
                rows="2"
                placeholder="Contoh: Ada keperluan dinas luar, kepentingan mendadak..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm transition-all"
              >
                Kirim Permintaan
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
