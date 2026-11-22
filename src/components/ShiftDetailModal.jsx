import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  X,
  AlertCircle,
  ArrowLeftRight,
  ShieldAlert,
  Share2
} from 'lucide-react';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const ShiftDetailModal = ({ isOpen, onClose, day, member, location, shiftCode, onOpenSwap }) => {
  const {
    currentUser,
    selectedMonth,
    selectedYear,
    locations,
    members,
    shifts,
    schedules,
    attendance,
    checkIn,
    getShiftTimeInfo,
    isShiftWindowActive
  } = useApp();

  if (!isOpen || !day) return null;

  const targetMember = member || currentUser;
  const targetLocation = location || (locations.length > 0 ? locations[0] : null);

  const shiftInfo = getShiftTimeInfo(shiftCode || 'L');
  const shiftObj = shifts.find(s => s.kode === shiftCode);

  const now = new Date();
  const isToday = now.getDate() === day && (now.getMonth() + 1) === selectedMonth && now.getFullYear() === selectedYear;

  // Check if target member already checked in on this day
  const targetDateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const checkInRecord = attendance.find(a => a.memberId === targetMember?.id && a.date === targetDateStr);

  // Find colleagues on duty at the same location on this date
  const colleagues = [];
  if (targetLocation) {
    const assigned = members.filter(m => m.assignedLocations?.includes(targetLocation.id));
    assigned.forEach(m => {
      const key = `${m.id}_${targetLocation.id}`;
      const code = schedules[key]?.[day] || 'L';
      if (code !== 'L') {
        const sObj = shifts.find(s => s.kode === code);
        colleagues.push({
          member: m,
          shiftCode: code,
          shiftName: sObj?.nama || code,
          isSelf: m.id === targetMember?.id
        });
      }
    });
  }

  const isCurrentShiftActive = isShiftWindowActive(shiftCode);
  const isSelf = currentUser?.id === targetMember?.id;
  const isOff = !shiftCode || shiftCode === 'L';

  const handleQuickCheckIn = () => {
    if (!targetLocation) return;
    const res = checkIn(targetLocation.id, shiftCode);
    if (res.success && onClose) {
      onClose();
    } else if (!res.success) {
      alert(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-scale-up max-h-[90vh] overflow-y-auto">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Detail Informasi Piket</h3>
              <p className="text-xs text-slate-500 font-medium">
                Tanggal {day} {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
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

        {/* Status Hari Ini Banner */}
        {isToday && (
          <div className="p-2.5 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs text-blue-900 font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              Jadwal Hari Ini (Sedang Berjalan)
            </span>
            <span className="text-[11px] bg-blue-200/60 px-2 py-0.5 rounded-md">Hari Ini</span>
          </div>
        )}

        {/* Identitas Petugas & Lokasi */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{targetMember?.avatar || '👤'}</span>
              <div>
                <p className="text-xs font-bold text-slate-900">{targetMember?.namaLengkap || targetMember?.nama}</p>
                <p className="text-[11px] text-slate-500">{targetMember?.jabatan} • <span className="uppercase text-emerald-700 font-bold">{targetMember?.role}</span></p>
              </div>
            </div>
            {isSelf && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Akun Anda
              </span>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200/70 flex items-start gap-2 text-xs text-slate-700">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">{targetLocation?.nama || 'Pos Pelayanan'}</p>
              <p className="text-[11px] text-slate-500">{targetLocation?.deskripsi || targetLocation?.alamat || 'Fasilitas Layanan Kesehatan'}</p>
            </div>
          </div>
        </div>

        {/* Informasi Shift Dinas */}
        <div className={`p-4 rounded-2xl border ${
          isOff
            ? 'bg-slate-50 border-slate-200 text-slate-600'
            : shiftCode === 'P'
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            : shiftCode === 'S'
            ? 'bg-sky-50/80 border-sky-200 text-sky-950'
            : shiftCode === 'M'
            ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
            : shiftCode === 'P/M'
            ? 'bg-purple-50/80 border-purple-200 text-purple-950'
            : 'bg-amber-50/80 border-amber-200 text-amber-950'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white ${
                isOff ? 'bg-slate-500' :
                shiftCode === 'P' ? 'bg-emerald-600' :
                shiftCode === 'S' ? 'bg-sky-600' :
                shiftCode === 'M' ? 'bg-indigo-600' :
                shiftCode === 'P/M' ? 'bg-purple-600' : 'bg-amber-600'
              }`}>
                {shiftCode}
              </span>
              <div>
                <p className="text-xs font-bold leading-tight">
                  {isOff ? 'Hari Lepas (Libur Dinas)' : `Shift ${shiftInfo.name}`}
                </p>
                <p className="text-[11px] opacity-80">{shiftObj?.deskripsi || 'Jadwal Penugasan Resmi'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold pt-2 border-t border-current/10">
            <Clock className="w-3.5 h-3.5" />
            <span>Jam Operasional: <strong>{isOff ? 'Bebas Tugas' : `${shiftInfo.time} WIB`}</strong></span>
          </div>
        </div>

        {/* Status Kehadiran / Check-in */}
        <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-2">
          <p className="text-xs font-bold text-slate-700">Status Kehadiran:</p>
          {checkInRecord ? (
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Sudah Check-In ({checkInRecord.time})
              </span>
              <span className="text-[10px] bg-emerald-200/60 px-2 py-0.5 rounded-md">Hadir Tepat Waktu</span>
            </div>
          ) : isOff ? (
            <p className="text-xs text-slate-500 italic">Tidak ada kewajiban presensi pada hari libur.</p>
          ) : isToday ? (
            <div className="space-y-2">
              <div className={`p-2 rounded-xl text-xs flex items-center gap-2 ${
                isCurrentShiftActive
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}>
                {isCurrentShiftActive ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span>
                  {isCurrentShiftActive
                    ? 'Jam dinas sedang aktif. Anda dapat melakukan konfirmasi kehadiran sekarang!'
                    : `Bukan jam shift Anda sekarang. Check-in hanya dibuka pada jam ${shiftInfo.time}.`}
                </span>
              </div>

              {isSelf && (
                <button
                  onClick={handleQuickCheckIn}
                  disabled={!isCurrentShiftActive && currentUser?.role === 'staf'}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                    isCurrentShiftActive || currentUser?.role === 'admin'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isCurrentShiftActive || currentUser?.role === 'admin'
                      ? 'Konfirmasi Kehadiran Sekarang'
                      : 'Check-In Terkunci (Bukan Jam Shift)'}
                  </span>
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Presensi dibuka pada hari H dinas.</p>
          )}
        </div>

        {/* Rekan Piket yang sama di Pos ini */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            Petugas Lain di Pos Ini pada Tanggal {day}:
          </p>

          {colleagues.length === 0 ? (
            <p className="text-xs text-slate-400 italic bg-slate-50 p-2.5 rounded-xl text-center">
              Tidak ada petugas yang dijadwalkan di pos ini pada tanggal ini.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {colleagues.map(({ member: col, shiftCode: sc, shiftName: sn, isSelf: selfCol }) => (
                <div
                  key={col.id}
                  className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                    selfCol
                      ? 'bg-emerald-50/70 border-emerald-300 font-bold text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{col.avatar}</span>
                    <span className="truncate">{col.nama} {selfCol && '(Anda)'}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    sc === 'P' ? 'bg-emerald-100 text-emerald-800' :
                    sc === 'S' ? 'bg-sky-100 text-sky-800' :
                    sc === 'M' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    Shift {sc} ({sn})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
          {isSelf && !isOff && onOpenSwap && (
            <button
              onClick={() => {
                if (onClose) onClose();
                onOpenSwap();
              }}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Minta Tukar Shift</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
