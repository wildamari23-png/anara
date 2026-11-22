import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowLeftRight,
  UserCheck,
  PhoneCall,
  Sparkles,
  AlertCircle,
  Lock,
  CalendarCheck
} from 'lucide-react';
import { ShiftDetailModal } from './ShiftDetailModal';

export const MonitoringView = ({ onOpenSwap }) => {
  const {
    currentUser,
    locations,
    members,
    schedules,
    shifts,
    attendance,
    checkIn,
    isShiftWindowActive,
    getShiftTimeInfo
  } = useApp();

  const [checkInNote, setCheckInNote] = useState('');
  const [selectedLocCheckIn, setSelectedLocCheckIn] = useState(locations[0]?.id || '');
  const [detailModalData, setDetailModalData] = useState(null);

  // Current Date Info
  const now = new Date();
  const currentDay = now.getDate();
  const currentHour = now.getHours();

  // Determine current active global shift based on hour
  let currentShiftCode = 'P';
  let currentShiftName = 'Pagi';
  let shiftTimeRange = '07:00 - 14:00';

  if (currentHour >= 7 && currentHour < 14) {
    currentShiftCode = 'P';
    currentShiftName = 'Pagi';
    shiftTimeRange = '07:00 - 14:00';
  } else if (currentHour >= 14 && currentHour < 21) {
    currentShiftCode = 'S';
    currentShiftName = 'Siang';
    shiftTimeRange = '14:00 - 21:00';
  } else {
    currentShiftCode = 'M';
    currentShiftName = 'Malam';
    shiftTimeRange = '21:00 - 07:00';
  }

  // Find current user's schedule for today
  let userTodayShift = 'L';
  let userTodayLocation = null;

  if (currentUser) {
    const assignedLocs = locations.filter(l => currentUser.assignedLocations?.includes(l.id));
    for (const loc of assignedLocs) {
      const key = `${currentUser.id}_${loc.id}`;
      const shift = schedules[key]?.[currentDay];
      if (shift && shift !== 'L') {
        userTodayShift = shift;
        userTodayLocation = loc;
        break;
      }
    }
  }

  const todayDateStr = now.toISOString().split('T')[0];
  const userCheckedIn = attendance.find(
    a => a.memberId === currentUser?.id && a.date === todayDateStr
  );

  // Validation: Apakah staf boleh check-in sekarang?
  const isOffToday = userTodayShift === 'L' || !userTodayShift;
  const isUserShiftActive = isShiftWindowActive(userTodayShift);
  const userShiftInfo = getShiftTimeInfo(userTodayShift);
  const isAdmin = currentUser?.role === 'admin';
  const canCheckIn = isAdmin || (!isOffToday && isUserShiftActive);

  const handleCheckInSubmit = () => {
    const targetLocId = selectedLocCheckIn || userTodayLocation?.id || locations[0]?.id;
    const res = checkIn(targetLocId, userTodayShift !== 'L' ? userTodayShift : 'P', checkInNote);
    if (!res.success) {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6 pb-28 animate-fade-in">
      {/* 1. Header Banner: Live Shift Status (Cerah & Menarik) */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-600 text-white shadow-lg shadow-emerald-900/10">
        <div className="absolute right-4 -bottom-6 text-white/10 pointer-events-none">
          <ShieldCheck className="w-36 h-36" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-200 animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-emerald-100">
              Monitoring Dinas Real-Time
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Shift {currentShiftName} Sedang Berlangsung
          </h2>
          <p className="text-emerald-50 text-sm mt-1 max-w-lg">
            Jam operasional shift saat ini: <span className="font-bold underline decoration-white/40">{shiftTimeRange} WITA</span> • Hari ke-{currentDay} bulan ini
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenSwap}
              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 transition-all border border-white/30 shadow-sm"
            >
              <ArrowLeftRight className="w-4 h-4 text-emerald-200" />
              Minta Tukar Shift
            </button>
            <div className="text-xs text-emerald-100 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Sistem presensi ketat sesuai jam shift
            </div>
          </div>
        </div>
      </div>

      {/* 2. Kartu Jadwal & Check-in Mandiri Saya (Dengan Validasi Jam Dinas Ketat) */}
      {currentUser && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm relative space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-lg shadow-sm">
                {currentUser.avatar}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Jadwal Saya Hari Ini</h3>
                <p className="text-xs text-slate-500 font-medium">{currentUser.namaLengkap || currentUser.nama} ({currentUser.jabatan})</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              isOffToday
                ? 'bg-slate-100 text-slate-500 border border-slate-200'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}>
              {isOffToday ? 'Hari Lepas (Libur Piket)' : `Shift: ${userTodayShift} (${userTodayLocation?.nama || 'Pos'})`}
            </span>
          </div>

          {userCheckedIn ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-900">Sudah Konfirmasi Hadir Hari Ini</p>
                  <p className="text-[11px] text-emerald-700">Tercatat jam {userCheckedIn.time} WITA di {userCheckedIn.locationName}</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-200/60 px-2.5 py-1 rounded-lg">
                Hadir Tepat Waktu
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Pesan Validasi Jam Dinas */}
              {isOffToday ? (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Anda tidak memiliki jadwal piket dinas hari ini (Hari Lepas / Libur). Konfirmasi kehadiran dinonaktifkan.
                  </span>
                </div>
              ) : !isUserShiftActive && !isAdmin ? (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Bukan Jam Dinas Anda! (Check-In Terkunci)</p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Jadwal dinas Anda hari ini adalah <strong>Shift {userTodayShift} ({userShiftInfo.name}: {userShiftInfo.time} WITA)</strong>.
                      Saat ini adalah <strong>Shift {currentShiftName} ({shiftTimeRange})</strong>.
                      Anda tidak dapat check-in di luar jam dinas yang telah ditentukan.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Jam dinas sesuai! Jadwal Anda: <strong>Shift {userTodayShift} ({userShiftInfo.name})</strong>. Silakan konfirmasi kehadiran Anda.
                  </span>
                </div>
              )}

              {/* Form Input Check-In */}
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedLocCheckIn}
                  onChange={(e) => setSelectedLocCheckIn(e.target.value)}
                  disabled={!canCheckIn}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {locations.filter(l => currentUser.assignedLocations?.includes(l.id)).map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.nama} - {loc.deskripsi || 'Pos Pelayanan'}</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Catatan kehadiran (opsional)..."
                  value={checkInNote}
                  onChange={(e) => setCheckInNote(e.target.value)}
                  disabled={!canCheckIn}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              {/* Tombol Check-In */}
              <button
                onClick={handleCheckInSubmit}
                disabled={!canCheckIn}
                className={`w-full py-3 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] ${
                  canCheckIn
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-900/10'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                {canCheckIn ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Konfirmasi Kehadiran / Check-In Piket (Shift {userTodayShift})</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>
                      {isOffToday
                        ? 'Check-In Dinonaktifkan (Hari Libur)'
                        : `Check-In Terkunci (Bukan Jam Shift ${userTodayShift})`}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. Monitoring Petugas Piket per Lokasi Hari Ini */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Petugas Dinas Hari Ini di Setiap Pos Lokasi
          </h3>
          <span className="text-xs font-semibold text-slate-500">Tanggal {currentDay}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locations.map((loc) => {
            const assignedMembers = members.filter(m => m.assignedLocations?.includes(loc.id));
            const dutyToday = assignedMembers.map(mem => {
              const key = `${mem.id}_${loc.id}`;
              const shiftCode = schedules[key]?.[currentDay] || 'L';
              return { member: mem, shiftCode };
            }).filter(item => item.shiftCode !== 'L');

            return (
              <div key={loc.id} className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: loc.warna }} />
                    <h4 className="text-sm font-bold text-slate-900">{loc.nama}</h4>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">
                    {dutyToday.length} Petugas Dinas
                  </span>
                </div>

                <div className="space-y-2">
                  {dutyToday.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2 text-center">
                      Tidak ada petugas yang dijadwalkan dinas hari ini di pos ini.
                    </p>
                  ) : (
                    dutyToday.map(({ member: mem, shiftCode: sc }) => {
                      const shiftObj = shifts.find(s => s.kode === sc);
                      const isShiftNow = isShiftWindowActive(sc);
                      const hasAttended = attendance.some(
                        a => a.memberId === mem.id && a.date === todayDateStr && a.locationId === loc.id
                      );

                      return (
                        <div
                          key={mem.id}
                          onClick={() => setDetailModalData({
                            day: currentDay,
                            member: mem,
                            location: loc,
                            shiftCode: sc
                          })}
                          className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer hover:border-emerald-300 ${
                            isShiftNow ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50/60 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{mem.avatar}</span>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{mem.nama}</p>
                              <p className="text-[10px] text-slate-500">
                                Shift {sc} ({shiftObj?.nama || 'Dinas'}) • {shiftObj?.jamMulai} - {shiftObj?.jamSelesai}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {hasAttended ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Hadir
                              </span>
                            ) : isShiftNow ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1 border border-amber-300 animate-pulse">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Bertugas
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium">
                                Jadwal {sc}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Detail Informatif Piket */}
      <ShiftDetailModal
        isOpen={Boolean(detailModalData)}
        onClose={() => setDetailModalData(null)}
        day={detailModalData?.day}
        member={detailModalData?.member}
        location={detailModalData?.location}
        shiftCode={detailModalData?.shiftCode}
        onOpenSwap={onOpenSwap}
      />
    </div>
  );
};
