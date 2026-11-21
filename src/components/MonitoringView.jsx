import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Clock, MapPin, CheckCircle2, ArrowLeftRight, UserCheck, PhoneCall, Sparkles } from 'lucide-react';

export const MonitoringView = ({ onOpenSwap }) => {
  const { currentUser, locations, members, schedules, shifts, attendance, checkIn } = useApp();
  const [checkInNote, setCheckInNote] = useState('');
  const [selectedLocCheckIn, setSelectedLocCheckIn] = useState(locations[0]?.id || '');

  // Current Date Info
  const now = new Date();
  const currentDay = now.getDate();
  const currentHour = now.getHours();

  // Determine current active shift based on hour
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
            Jam operasional: <span className="font-bold underline decoration-white/40">{shiftTimeRange}</span> • Hari ke-{currentDay} bulan ini
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
              Diperbarui otomatis secara real-time
            </div>
          </div>
        </div>
      </div>

      {/* 2. Kartu Jadwal & Check-in Mandiri Saya (Cerah) */}
      {currentUser && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-lg shadow-sm">
                {currentUser.avatar}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Jadwal Saya Hari Ini</h3>
                <p className="text-xs text-slate-500 font-medium">{currentUser.namaLengkap || currentUser.nama}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              userTodayShift === 'L'
                ? 'bg-slate-100 text-slate-500 border border-slate-200'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse'
            }`}>
              Shift: {userTodayShift} {userTodayShift !== 'L' ? `(${userTodayLocation?.nama || 'Pos'})` : '(Libur Piket)'}
            </span>
          </div>

          {userCheckedIn ? (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-900">Sudah Konfirmasi Hadir</p>
                  <p className="text-[11px] text-emerald-700">Pukul {userCheckedIn.time} di {userCheckedIn.locationName}</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-200/60 px-2 py-1 rounded-lg">
                Tepat Waktu
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedLocCheckIn}
                  onChange={(e) => setSelectedLocCheckIn(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                >
                  {locations.filter(l => currentUser.assignedLocations?.includes(l.id)).map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.nama} - {loc.deskripsi}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Catatan kehadiran (opsional)..."
                  value={checkInNote}
                  onChange={(e) => setCheckInNote(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                onClick={() => checkIn(selectedLocCheckIn || locations[0]?.id, userTodayShift !== 'L' ? userTodayShift : 'P', checkInNote)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <CheckCircle2 className="w-4 h-4" />
                Konfirmasi Kehadiran / Check-In Piket
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. Monitoring Petugas Piket per Lokasi Hari Ini (Hanya Petugas yang Ditentukan) */}
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
            // Find staff assigned to this location
            const assignedMembers = members.filter(m => m.assignedLocations?.includes(loc.id));
            const dutyToday = assignedMembers.map(mem => {
              const key = `${mem.id}_${loc.id}`;
              const shiftCode = schedules[key]?.[currentDay] || 'L';
              return { member: mem, shiftCode };
            }).filter(item => item.shiftCode !== 'L');

            return (
              <div
                key={loc.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: loc.warna }}
                />

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: loc.warna }}
                    />
                    <h4 className="text-sm font-bold text-slate-900">{loc.nama}</h4>
                    <span className="text-[11px] text-slate-500 font-medium">({loc.deskripsi})</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                    {dutyToday.length} Dinas Hari Ini
                  </span>
                </div>

                {dutyToday.length > 0 ? (
                  <div className="space-y-2">
                    {dutyToday.map(({ member, shiftCode }) => {
                      const shiftObj = shifts.find(s => s.kode === shiftCode) || {
                        nama: shiftCode,
                        bgClass: 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      };
                      return (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{member.avatar}</span>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{member.namaLengkap || member.nama}</p>
                              <p className="text-[10px] text-slate-500">{member.jabatan}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${shiftObj.bgClass}`}>
                              {shiftCode} ({shiftObj.nama})
                            </span>
                            {member.noHp && (
                              <a
                                href={`https://wa.me/${member.noHp.replace(/^0/, '62')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-white border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm"
                                title="Kirim WA"
                              >
                                <PhoneCall className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-slate-50 text-center text-xs text-slate-500 italic border border-slate-200">
                    Semua petugas pos ini sedang libur / lepas dinas hari ini.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Live Check-in Activity Feed */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          Riwayat Check-In & Kehadiran Terakhir
        </h3>
        {attendance.length > 0 ? (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {attendance.slice(0, 5).map(att => (
              <div
                key={att.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{att.memberName} • <span className="text-emerald-700">{att.locationName}</span></p>
                    <p className="text-[10px] text-slate-500">{att.note}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[11px] text-slate-700 font-bold">{att.time}</span>
                  <p className="text-[10px] text-emerald-600 font-bold">{att.status}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4">Belum ada riwayat check-in.</p>
        )}
      </div>
    </div>
  );
};
