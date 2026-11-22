import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Filter,
  Sparkles,
  Share2,
  ChevronLeft,
  ChevronRight,
  Check,
  MapPin,
  User,
  Zap,
  LayoutGrid,
  CalendarDays,
  Table,
  Lock,
  Clock,
  ShieldCheck,
  Info,
  CalendarCheck,
  FileSpreadsheet,
  Bell,
  AlertCircle,
  History,
  ChevronDown,
  UserCheck
} from 'lucide-react';
import { ShiftDetailModal } from './ShiftDetailModal';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const DAY_NAMES_SHORT = ['Mgg', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export const ScheduleView = () => {
  const {
    currentUser,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    locations,
    members,
    shifts,
    schedules,
    updateSchedule,
    autoSchedule,
    setActiveTab,
    sendWebNotification,
    notificationPermission,
    requestNotificationPermission
  } = useApp();

  const isStaff = currentUser?.role === 'staf';

  // Mode Tampilan untuk Admin: 'daily', 'calendar', 'member', 'table', 'my_agenda'
  const [viewMode, setViewMode] = useState('daily');

  // Mode Tampilan untuk Staf & Agenda: DEFAULT 'agenda' (sesuai instruksi pengguna)
  const [selectedStaffSubView, setSelectedStaffSubView] = useState('agenda');

  // Auto-hide tanggal shift yang sudah lewat (bisa dibuka lagi)
  const [showPastDays, setShowPastDays] = useState(false);

  // State untuk Modal Detail Informatif Piket
  const [detailModalData, setDetailModalData] = useState(null);

  // Selected Day for Daily Input (Default hari ini)
  const now = new Date();
  const [selectedDay, setSelectedDay] = useState(now.getDate());

  // Filter Lokasi
  const [activeLocationFilter, setActiveLocationFilter] = useState('all');

  // Selected Member for Member-centric input mode (Admin only)
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || '');
  const [painterShift, setPainterShift] = useState('P');

  // Days in month
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Month navigation
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  // Helper: Get day name of specific date
  const getDayInfo = (day) => {
    const d = new Date(selectedYear, selectedMonth - 1, day);
    const dayOfWeek = d.getDay();
    return {
      fullName: DAY_NAMES_ID[dayOfWeek],
      shortName: DAY_NAMES_SHORT[dayOfWeek],
      isSunday: dayOfWeek === 0,
      isFriday: dayOfWeek === 5
    };
  };

  // Helper: Cek apakah tanggal sudah lewat (untuk auto-hide di agenda)
  const isDayInPast = (day) => {
    const isCurrentMonth = now.getMonth() + 1 === selectedMonth && now.getFullYear() === selectedYear;
    if (isCurrentMonth) {
      return day < now.getDate();
    }
    const itemDate = new Date(selectedYear, selectedMonth - 1, day, 23, 59, 59);
    return itemDate < now;
  };

  // Helper: Get only members assigned to a specific location
  const getMembersForLocation = (locationId) => {
    return members.filter(m => {
      if (m.assignedLocations && Array.isArray(m.assignedLocations)) {
        return m.assignedLocations.includes(locationId);
      }
      return false;
    });
  };

  // Get locations assigned to current staff member
  const staffLocations = locations.filter(loc => {
    if (currentUser?.assignedLocations && Array.isArray(currentUser.assignedLocations)) {
      return currentUser.assignedLocations.includes(loc.id);
    }
    return true;
  });

  // Share Staff Schedule to WhatsApp
  const handleShareStaffWhatsApp = () => {
    if (!currentUser) return;
    let text = `*📋 JADWAL PIKET SAYA - KITA PIKET*\n`;
    text += `*Petugas:* ${currentUser.namaLengkap || currentUser.nama} (${currentUser.jabatan})\n`;
    text += `*Periode:* ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}\n\n`;

    daysArray.forEach(day => {
      const dayInfo = getDayInfo(day);
      let dayEntries = [];

      staffLocations.forEach(loc => {
        const key = `${currentUser.id}_${loc.id}`;
        const shiftCode = schedules[key]?.[day] || 'L';
        if (shiftCode && shiftCode !== 'L') {
          const shiftObj = shifts.find(s => s.kode === shiftCode);
          dayEntries.push(`${loc.nama}: *Shift ${shiftCode}* (${shiftObj?.nama || shiftCode})`);
        }
      });

      if (dayEntries.length > 0) {
        text += `• *Tgl ${day} (${dayInfo.shortName})*: ${dayEntries.join(', ')}\n`;
      }
    });

    text += `\n_Aplikasi Kita Piket - Sistem Jadwal Dinas_`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Share Admin Schedule to WhatsApp
  const handleShareAdminWhatsApp = () => {
    const dayInfo = getDayInfo(selectedDay);
    let text = `*📋 JADWAL PIKET DINAS*\n`;
    text += `*Hari:* ${dayInfo.fullName}, ${selectedDay} ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}\n\n`;

    locations.forEach(loc => {
      const assigned = getMembersForLocation(loc.id);
      text += `*📍 ${loc.nama}*:\n`;
      let count = 0;
      assigned.forEach(mem => {
        const key = `${mem.id}_${loc.id}`;
        const shiftCode = schedules[key]?.[selectedDay] || 'L';
        const shiftObj = shifts.find(s => s.kode === shiftCode);
        text += `• ${mem.nama}: *Shift ${shiftCode}* (${shiftObj?.nama || 'Libur'})\n`;
        count++;
      });
      if (count === 0) text += `• (Tidak ada petugas yang dijadwalkan)\n`;
      text += `\n`;
    });

    text += `_Aplikasi Kita Piket - Sistem Jadwal Terpadu_`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // =========================================================================
  // TAMPILAN KHUSUS STAF: HANYA MENAMPILKAN JADWAL DIRI SENDIRI (READ-ONLY)
  // =========================================================================
  if (isStaff) {
    let countP = 0, countS = 0, countM = 0, countL = 0, countDouble = 0;
    daysArray.forEach(day => {
      let isWorking = false;
      staffLocations.forEach(loc => {
        const key = `${currentUser.id}_${loc.id}`;
        const shift = schedules[key]?.[day] || 'L';
        if (shift === 'P') countP++;
        else if (shift === 'S') countS++;
        else if (shift === 'M') countM++;
        else if (shift === 'P/M' || shift === 'P/S' || shift === 'S/M' || shift === 'PSM') countDouble++;
        else if (shift.includes('P') || shift.includes('S') || shift.includes('M')) countP++;
        if (shift !== 'L') isWorking = true;
      });
      if (!isWorking) countL++;
    });

    return (
      <div className="space-y-5 pb-28 animate-fade-in">
        {/* Banner Aktifkan Notifikasi HP (Jika belum diizinkan) */}
        {notificationPermission !== 'granted' && (
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white shrink-0">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold leading-tight">Aktifkan Notifikasi Pengingat di HP Anda</h4>
                <p className="text-xs text-amber-100 mt-0.5">
                  Dapatkan pengingat dinas otomatis di bilah status atas HP sebelum shift Anda dimulai.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={requestNotificationPermission}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-white text-amber-800 hover:bg-amber-50 font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Bell className="w-4 h-4" />
                <span>Aktifkan Notifikasi HP</span>
              </button>
            </div>
          </div>
        )}

        {/* Banner Hak Akses Staf */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl shadow-sm shrink-0">
              {currentUser.avatar || '👤'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Jadwal Saya: {currentUser.namaLengkap || currentUser.nama}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700 border border-blue-300 uppercase">
                  Akses Staf
                </span>
              </div>
              <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Mode Baca (Read-Only) • Pos: <strong>{staffLocations.map(l => l.nama).join(', ')}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleShareStaffWhatsApp}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share ke WA</span>
            </button>
            <button
              onClick={() => setActiveTab('monitoring')}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Check-In Hari Ini</span>
            </button>
          </div>
        </div>

        {/* Month Selector Bar & Switcher */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-center px-3 py-1">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5 justify-center">
                <Calendar className="w-4 h-4 text-blue-600" />
                {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">Bulan Dinas</p>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Sub View Toggle: DEFAULT AGENDA HARIAN */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setSelectedStaffSubView('agenda')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStaffSubView === 'agenda'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Agenda Harian</span>
            </button>
            <button
              onClick={() => setSelectedStaffSubView('calendar')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStaffSubView === 'calendar'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kalender Jadwal</span>
            </button>
          </div>
        </div>

        {/* Ringkasan Shift Bulan Ini */}
        <div className={`grid grid-cols-2 gap-3 ${countDouble > 0 ? 'sm:grid-cols-5' : 'sm:grid-cols-4'}`}>
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
            <span className="text-xs font-bold text-emerald-800">Shift Pagi (P)</span>
            <p className="text-2xl font-black text-emerald-700 mt-0.5">{countP} <span className="text-xs font-semibold">hari</span></p>
          </div>
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 text-center">
            <span className="text-xs font-bold text-sky-800">Shift Siang (S)</span>
            <p className="text-2xl font-black text-sky-700 mt-0.5">{countS} <span className="text-xs font-semibold">hari</span></p>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3 text-center">
            <span className="text-xs font-bold text-indigo-800">Shift Malam (M)</span>
            <p className="text-2xl font-black text-indigo-700 mt-0.5">{countM} <span className="text-xs font-semibold">hari</span></p>
          </div>
          {countDouble > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 text-center">
              <span className="text-xs font-bold text-purple-800">Pagi-Malam / Double</span>
              <p className="text-2xl font-black text-purple-700 mt-0.5">{countDouble} <span className="text-xs font-semibold">hari</span></p>
            </div>
          )}
          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3 text-center">
            <span className="text-xs font-bold text-slate-700">Lepas / Libur (L)</span>
            <p className="text-2xl font-black text-slate-700 mt-0.5">{countL} <span className="text-xs font-semibold">hari</span></p>
          </div>
        </div>

        {/* SUB VIEW 1: AGENDA HARIAN (DEFAULT - SANGAT RAPI DI HP) */}
        {selectedStaffSubView === 'agenda' && (
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                Daftar Agenda Dinas Anda ({MONTH_NAMES[selectedMonth - 1]} {selectedYear})
              </h4>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                💡 Ketuk untuk melihat detail shift & rekan piket
              </span>
            </div>

            {/* Accordion Tombol Jadwal yang Sudah Lewat (Auto-Hide Default) */}
            {(() => {
              const pastDays = daysArray.filter(day => isDayInPast(day));
              const upcomingDays = daysArray.filter(day => !isDayInPast(day));

              const renderDayCard = (day, isPast = false) => {
                const dayInfo = getDayInfo(day);
                const isToday = now.getDate() === day && now.getMonth() + 1 === selectedMonth && now.getFullYear() === selectedYear;

                const dayShifts = staffLocations.map(loc => {
                  const key = `${currentUser.id}_${loc.id}`;
                  return { loc, shift: schedules[key]?.[day] || 'L' };
                });

                const isOff = dayShifts.every(s => s.shift === 'L');
                const primaryItem = dayShifts[0];

                return (
                  <div
                    key={day}
                    onClick={() => setDetailModalData({
                      day,
                      member: currentUser,
                      location: primaryItem?.loc,
                      shiftCode: primaryItem?.shift || 'L'
                    })}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] ${
                      isToday
                        ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-400/20 shadow-xs'
                        : isOff
                        ? 'border-slate-100 bg-slate-50/40 text-slate-400'
                        : isPast
                        ? 'border-slate-200/60 bg-slate-50/50 text-slate-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50/80 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-bold text-xs shrink-0 ${
                        isToday ? 'bg-blue-600 text-white shadow-sm' : isOff ? 'bg-slate-100 text-slate-500' : isPast ? 'bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-800'
                      }`}>
                        <span className="text-[10px] uppercase font-semibold leading-none">{dayInfo.shortName}</span>
                        <span className="text-sm font-black leading-tight mt-0.5">{day}</span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-xs font-bold ${isToday ? 'text-blue-950 font-black' : isPast ? 'text-slate-600' : 'text-slate-800'}`}>
                            {dayInfo.fullName}, {day} {MONTH_NAMES[selectedMonth - 1]}
                          </p>
                          {isToday && (
                            <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-[9px] font-bold uppercase animate-pulse">
                              Hari ini
                            </span>
                          )}
                          {isPast && (
                            <span className="px-1.5 py-0.2 rounded-md bg-slate-200/60 text-slate-500 text-[9px] font-semibold">
                              Lewat
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {isOff ? 'Hari Lepas / Libur Piket' : staffLocations.map(l => l.nama).join(' & ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {dayShifts.map(({ loc, shift }) => {
                        const shiftObj = shifts.find(s => s.kode === shift);
                        const isLibur = shift === 'L';
                        return (
                          <div
                            key={loc.id}
                            className={`px-3 py-1.5 rounded-xl text-center flex items-center gap-1.5 ${
                              isLibur
                                ? 'bg-slate-100 text-slate-500 text-xs'
                                : shift === 'P'
                                ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                                : shift === 'S'
                                ? 'bg-sky-100 text-sky-800 font-bold border border-sky-300'
                                : shift === 'M'
                                ? 'bg-indigo-100 text-indigo-800 font-bold border border-indigo-300'
                                : shift === 'P/M'
                                ? 'bg-purple-100 text-purple-800 font-bold border border-purple-300'
                                : 'bg-amber-100 text-amber-800 font-bold border border-amber-300'
                            }`}
                          >
                            <span className="text-xs font-black">{shift}</span>
                            <span className="text-[11px] font-semibold hidden sm:inline">({shiftObj?.nama || 'Libur'})</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              };

              return (
                <div className="space-y-3">
                  {pastDays.length > 0 && (
                    <div className="mb-2">
                      <button
                        type="button"
                        onClick={() => setShowPastDays(prev => !prev)}
                        className="w-full py-2.5 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-between transition-all border border-slate-200/90 shadow-2xs group"
                      >
                        <div className="flex items-center gap-2">
                          <History className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                          <span>
                            {showPastDays
                              ? `Sembunyikan ${pastDays.length} Tanggal yang Sudah Lewat`
                              : `Buka ${pastDays.length} Tanggal yang Sudah Lewat (1 - ${now.getDate() - 1} ${MONTH_NAMES[selectedMonth - 1]})`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                          <span className="bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                            {showPastDays ? 'Tutup' : 'Auto-Hide'}
                          </span>
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showPastDays ? 'rotate-180' : ''}`} />
                        </div>
                      </button>

                      {showPastDays && (
                        <div className="space-y-2 mt-2 pt-2 border-t border-dashed border-slate-200 animate-fade-in opacity-85">
                          {pastDays.map(day => renderDayCard(day, true))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    {upcomingDays.length === 0 ? (
                      <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                        <p className="font-semibold">Semua tanggal di bulan ini sudah lewat.</p>
                        <p className="text-[11px] text-slate-400 mt-1">Klik tombol di atas untuk membuka riwayat jadwal.</p>
                      </div>
                    ) : (
                      upcomingDays.map(day => renderDayCard(day, false))
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* SUB VIEW 2: KALENDER KOTAK KHUSUS STAF (DIPERBAIKI UNTUK LAYAR HP - TIDAK MENUMPUK) */}
        {selectedStaffSubView === 'calendar' && (
          <div className="bg-white rounded-3xl p-3 sm:p-5 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-blue-600" />
                Kalender Piket Anda ({MONTH_NAMES[selectedMonth - 1]} {selectedYear})
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">
                💡 Ketuk tanggal untuk melihat detail lengkap & rekan piket
              </span>
            </div>

            {/* Grid 7 Kolom Responsif */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {DAY_NAMES_SHORT.map((name, idx) => (
                <div
                  key={name}
                  className={`py-1.5 text-center text-[11px] sm:text-xs font-bold rounded-xl ${
                    idx === 0 ? 'bg-rose-50 text-rose-600' : idx === 5 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {name}
                </div>
              ))}

              {/* Tanggal kosong awal bulan */}
              {Array.from({ length: new Date(selectedYear, selectedMonth - 1, 1).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-14 sm:min-h-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-100" />
              ))}

              {/* Kotak Tanggal: Compact & Bebas Teks Menumpuk di HP */}
              {daysArray.map((day) => {
                const dayInfo = getDayInfo(day);
                const isToday = now.getDate() === day && now.getMonth() + 1 === selectedMonth && now.getFullYear() === selectedYear;

                const dayShifts = [];
                staffLocations.forEach(loc => {
                  const key = `${currentUser.id}_${loc.id}`;
                  const shift = schedules[key]?.[day] || 'L';
                  dayShifts.push({ loc, shift });
                });

                const primaryShift = dayShifts[0]?.shift || 'L';
                const isOff = dayShifts.every(s => s.shift === 'L');

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setDetailModalData({
                      day,
                      member: currentUser,
                      location: dayShifts[0]?.loc,
                      shiftCode: primaryShift
                    })}
                    className={`min-h-14 sm:min-h-20 p-1 sm:p-2 rounded-2xl border flex flex-col justify-between text-left transition-all hover:scale-102 active:scale-98 cursor-pointer ${
                      isToday
                        ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-400/30 shadow-xs'
                        : isOff
                        ? 'border-slate-200/80 bg-slate-50/60'
                        : 'border-slate-200 bg-white hover:border-blue-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-[10px] sm:text-xs font-black ${
                        isToday ? 'text-blue-700 bg-blue-100 px-1 rounded' : dayInfo.isSunday ? 'text-rose-600' : 'text-slate-800'
                      }`}>
                        {day}
                      </span>
                      {isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 sm:hidden" />
                      )}
                    </div>

                    {/* Badge Shift: Sangat Bersih di HP, Tanpa Teks Menumpuk */}
                    <div className="flex flex-col gap-1 mt-1 w-full">
                      {dayShifts.map(({ loc, shift }) => {
                        const isLibur = shift === 'L';
                        return (
                          <div
                            key={loc.id}
                            className={`w-full py-0.5 sm:py-1 px-1 rounded-lg text-center flex items-center justify-center gap-1 ${
                              isLibur
                                ? 'bg-slate-100 text-slate-400 text-[9px]'
                                : shift === 'P'
                                ? 'bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-300'
                                : shift === 'S'
                                ? 'bg-sky-100 text-sky-800 font-extrabold border border-sky-300'
                                : shift === 'M'
                                ? 'bg-indigo-100 text-indigo-800 font-extrabold border border-indigo-300'
                                : shift === 'P/M'
                                ? 'bg-purple-100 text-purple-800 font-extrabold border border-purple-300'
                                : 'bg-amber-100 text-amber-800 font-extrabold border border-amber-300'
                            }`}
                          >
                            <span className="text-[11px] sm:text-xs font-black leading-none">{shift}</span>
                            <span className="text-[9px] font-bold hidden sm:inline truncate">
                              {loc.kode || loc.nama}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Detail Informatif Piket */}
        <ShiftDetailModal
          isOpen={Boolean(detailModalData)}
          onClose={() => setDetailModalData(null)}
          day={detailModalData?.day}
          member={detailModalData?.member}
          location={detailModalData?.location}
          shiftCode={detailModalData?.shiftCode}
          onOpenSwap={() => setActiveTab('monitoring')}
        />
      </div>
    );
  }

  // =========================================================================
  // TAMPILAN ADMIN / KOORDINATOR: LENGKAP BISA EDIT SEMUA JADWAL
  // =========================================================================
  return (
    <div className="space-y-5 pb-28 animate-fade-in">
      {/* Banner Aktifkan Notifikasi HP (Jika belum diizinkan) */}
      {notificationPermission !== 'granted' && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold leading-tight">Aktifkan Notifikasi Pengingat di HP Anda</h4>
              <p className="text-xs text-amber-100 mt-0.5">
                Dapatkan notifikasi pengingat otomatis di bagian atas HP sebelum shift tugas dinas dimulai.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={requestNotificationPermission}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-white text-amber-800 hover:bg-amber-50 font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Bell className="w-4 h-4" />
              <span>Aktifkan Notifikasi HP</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Month Bar & Mode Switcher */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-center px-3 py-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-1.5 justify-center">
              <Calendar className="w-4 h-4 text-emerald-600" />
              {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">Bulan Aktif</p>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
            title="Bulan Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setViewMode('my_agenda')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              viewMode === 'my_agenda'
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/20'
                : 'text-blue-700 hover:text-blue-900 bg-blue-50/80 font-bold'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            Agenda Saya
          </button>

          <button
            onClick={() => setViewMode('daily')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              viewMode === 'daily'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Input Cepat Harian
          </button>

          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              viewMode === 'calendar'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Kalender Kotak
          </button>

          <button
            onClick={() => setViewMode('member')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              viewMode === 'member'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Per Petugas
          </button>

          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              viewMode === 'table'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            Tabel Matriks
          </button>
        </div>

        {/* Share WA Button */}
        <button
          onClick={handleShareAdminWhatsApp}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Share2 className="w-3.5 h-3.5" />
          Kirim ke WA
        </button>
      </div>

      {/* MODE 0: AGENDA SAYA (KHUSUS ADMIN MELIHAT JADWAL DIRI SENDIRI SEPERTI STAF) */}
      {viewMode === 'my_agenda' && (
        <div className="space-y-4 animate-fade-in">
          {/* Banner Akses Agenda Admin */}
          <div className="bg-gradient-to-r from-indigo-50 via-sky-50 to-emerald-50 border border-indigo-200 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl shadow-sm shrink-0">
                {currentUser?.avatar || '👨‍⚕️'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Agenda Saya: {currentUser?.namaLengkap || currentUser?.nama}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700 border border-indigo-300 uppercase">
                    Admin / Koordinator
                  </span>
                </div>
                <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Jadwal Penugasan Pribadi Anda • Pos: <strong>{staffLocations.map(l => l.nama).join(', ')}</strong></span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleShareStaffWhatsApp}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share ke WA</span>
              </button>
              <button
                onClick={() => setActiveTab('monitoring')}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Check-In Hari Ini</span>
              </button>
            </div>
          </div>

          {/* Sub View Toggle: Agenda Harian vs Kalender Pribadi */}
          <div className="flex items-center justify-between bg-white rounded-2xl p-2.5 px-4 border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-600" />
              Tampilan Agenda Dinas Anda:
            </span>
            <div className="flex items-center p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setSelectedStaffSubView('agenda')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedStaffSubView === 'agenda'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Agenda Harian</span>
              </button>
              <button
                onClick={() => setSelectedStaffSubView('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedStaffSubView === 'calendar'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kalender Jadwal</span>
              </button>
            </div>
          </div>

          {/* Ringkasan Shift Bulan Ini Admin */}
          {(() => {
            let adminCountP = 0, adminCountS = 0, adminCountM = 0, adminCountL = 0, adminCountDouble = 0;
            daysArray.forEach(day => {
              let isWorking = false;
              staffLocations.forEach(loc => {
                const key = `${currentUser?.id}_${loc.id}`;
                const shift = schedules[key]?.[day] || 'L';
                if (shift === 'P') adminCountP++;
                else if (shift === 'S') adminCountS++;
                else if (shift === 'M') adminCountM++;
                else if (shift === 'P/M' || shift === 'P/S' || shift === 'S/M' || shift === 'PSM') adminCountDouble++;
                else if (shift.includes('P') || shift.includes('S') || shift.includes('M')) adminCountP++;
                if (shift !== 'L') isWorking = true;
              });
              if (!isWorking) adminCountL++;
            });

            return (
              <div className={`grid grid-cols-2 gap-3 ${adminCountDouble > 0 ? 'sm:grid-cols-5' : 'sm:grid-cols-4'}`}>
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
                  <span className="text-xs font-bold text-emerald-800">Shift Pagi (P)</span>
                  <p className="text-2xl font-black text-emerald-700 mt-0.5">{adminCountP} <span className="text-xs font-semibold">hari</span></p>
                </div>
                <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 text-center">
                  <span className="text-xs font-bold text-sky-800">Shift Siang (S)</span>
                  <p className="text-2xl font-black text-sky-700 mt-0.5">{adminCountS} <span className="text-xs font-semibold">hari</span></p>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3 text-center">
                  <span className="text-xs font-bold text-indigo-800">Shift Malam (M)</span>
                  <p className="text-2xl font-black text-indigo-700 mt-0.5">{adminCountM} <span className="text-xs font-semibold">hari</span></p>
                </div>
                {adminCountDouble > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 text-center">
                    <span className="text-xs font-bold text-purple-800">Pagi-Malam / Double</span>
                    <p className="text-2xl font-black text-purple-700 mt-0.5">{adminCountDouble} <span className="text-xs font-semibold">hari</span></p>
                  </div>
                )}
                <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3 text-center">
                  <span className="text-xs font-bold text-slate-700">Lepas / Libur (L)</span>
                  <p className="text-2xl font-black text-slate-700 mt-0.5">{adminCountL} <span className="text-xs font-semibold">hari</span></p>
                </div>
              </div>
            );
          })()}

          {/* SUB VIEW 1: AGENDA HARIAN ADMIN (DILENGKAPI AUTO-HIDE TANGGAL LEWAT) */}
          {selectedStaffSubView === 'agenda' && (
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-600" />
                  Daftar Agenda Dinas Anda ({MONTH_NAMES[selectedMonth - 1]} {selectedYear})
                </h4>
                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                  💡 Ketuk untuk melihat detail shift & rekan piket
                </span>
              </div>

              {(() => {
                const pastDays = daysArray.filter(day => isDayInPast(day));
                const upcomingDays = daysArray.filter(day => !isDayInPast(day));

                const renderAdminDayCard = (day, isPast = false) => {
                  const dayInfo = getDayInfo(day);
                  const isToday = now.getDate() === day && now.getMonth() + 1 === selectedMonth && now.getFullYear() === selectedYear;

                  const dayShifts = staffLocations.map(loc => {
                    const key = `${currentUser.id}_${loc.id}`;
                    return { loc, shift: schedules[key]?.[day] || 'L' };
                  });

                  const isOff = dayShifts.every(s => s.shift === 'L');
                  const primaryItem = dayShifts[0];

                  return (
                    <div
                      key={day}
                      onClick={() => setDetailModalData({
                        day,
                        member: currentUser,
                        location: primaryItem?.loc,
                        shiftCode: primaryItem?.shift || 'L'
                      })}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] ${
                        isToday
                          ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-400/20 shadow-xs'
                          : isOff
                          ? 'border-slate-100 bg-slate-50/40 text-slate-400'
                          : isPast
                          ? 'border-slate-200/60 bg-slate-50/50 text-slate-600'
                          : 'border-slate-200 bg-white hover:bg-slate-50/80 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-bold text-xs shrink-0 ${
                          isToday ? 'bg-blue-600 text-white shadow-sm' : isOff ? 'bg-slate-100 text-slate-500' : isPast ? 'bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-800'
                        }`}>
                          <span className="text-[10px] uppercase font-semibold leading-none">{dayInfo.shortName}</span>
                          <span className="text-sm font-black leading-tight mt-0.5">{day}</span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-xs font-bold ${isToday ? 'text-blue-950 font-black' : isPast ? 'text-slate-600' : 'text-slate-800'}`}>
                              {dayInfo.fullName}, {day} {MONTH_NAMES[selectedMonth - 1]}
                            </p>
                            {isToday && (
                              <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-[9px] font-bold uppercase animate-pulse">
                                Hari ini
                              </span>
                            )}
                            {isPast && (
                              <span className="px-1.5 py-0.2 rounded-md bg-slate-200/60 text-slate-500 text-[9px] font-semibold">
                                Lewat
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                            {isOff ? 'Hari Lepas / Libur Piket' : staffLocations.map(l => l.nama).join(' & ')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {dayShifts.map(({ loc, shift }) => {
                          const shiftObj = shifts.find(s => s.kode === shift);
                          const isLibur = shift === 'L';
                          return (
                            <div
                              key={loc.id}
                              className={`px-3 py-1.5 rounded-xl text-center flex items-center gap-1.5 ${
                                isLibur
                                  ? 'bg-slate-100 text-slate-500 text-xs'
                                  : shift === 'P'
                                  ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                                  : shift === 'S'
                                  ? 'bg-sky-100 text-sky-800 font-bold border border-sky-300'
                                  : shift === 'M'
                                  ? 'bg-indigo-100 text-indigo-800 font-bold border border-indigo-300'
                                  : shift === 'P/M'
                                  ? 'bg-purple-100 text-purple-800 font-bold border border-purple-300'
                                  : 'bg-amber-100 text-amber-800 font-bold border border-amber-300'
                              }`}
                            >
                              <span className="text-xs font-black">{shift}</span>
                              <span className="text-[11px] font-semibold hidden sm:inline">({shiftObj?.nama || 'Libur'})</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                };

                return (
                  <div className="space-y-3">
                    {pastDays.length > 0 && (
                      <div className="mb-2">
                        <button
                          type="button"
                          onClick={() => setShowPastDays(prev => !prev)}
                          className="w-full py-2.5 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-between transition-all border border-slate-200/90 shadow-2xs group"
                        >
                          <div className="flex items-center gap-2">
                            <History className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                            <span>
                              {showPastDays
                                ? `Sembunyikan ${pastDays.length} Tanggal yang Sudah Lewat`
                                : `Buka ${pastDays.length} Tanggal yang Sudah Lewat (1 - ${now.getDate() - 1} ${MONTH_NAMES[selectedMonth - 1]})`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                            <span className="bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                              {showPastDays ? 'Tutup' : 'Auto-Hide'}
                            </span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showPastDays ? 'rotate-180' : ''}`} />
                          </div>
                        </button>

                        {showPastDays && (
                          <div className="space-y-2 mt-2 pt-2 border-t border-dashed border-slate-200 animate-fade-in opacity-85">
                            {pastDays.map(day => renderAdminDayCard(day, true))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      {upcomingDays.length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                          <p className="font-semibold">Semua tanggal di bulan ini sudah lewat.</p>
                          <p className="text-[11px] text-slate-400 mt-1">Klik tombol di atas untuk membuka riwayat jadwal.</p>
                        </div>
                      ) : (
                        upcomingDays.map(day => renderAdminDayCard(day, false))
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* SUB VIEW 2: KALENDER PRIBADI ADMIN */}
          {selectedStaffSubView === 'calendar' && (
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-blue-600" />
                  Kalender Piket Anda ({MONTH_NAMES[selectedMonth - 1]} {selectedYear})
                </h4>
                <span className="text-[11px] text-slate-500 font-medium">
                  💡 Ketuk tanggal untuk melihat detail lengkap & rekan piket
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {DAY_NAMES_SHORT.map((name, idx) => (
                  <div
                    key={name}
                    className={`py-1.5 text-center text-[11px] sm:text-xs font-bold rounded-xl ${
                      idx === 0 ? 'bg-rose-50 text-rose-600' : idx === 5 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {name}
                  </div>
                ))}

                {Array.from({ length: new Date(selectedYear, selectedMonth - 1, 1).getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-14 sm:min-h-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-100" />
                ))}

                {daysArray.map((day) => {
                  const dayInfo = getDayInfo(day);
                  const isToday = now.getDate() === day && now.getMonth() + 1 === selectedMonth && now.getFullYear() === selectedYear;

                  const dayShifts = [];
                  staffLocations.forEach(loc => {
                    const key = `${currentUser.id}_${loc.id}`;
                    const shift = schedules[key]?.[day] || 'L';
                    dayShifts.push({ loc, shift });
                  });

                  const primaryShift = dayShifts[0]?.shift || 'L';
                  const isOff = dayShifts.every(s => s.shift === 'L');

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setDetailModalData({
                        day,
                        member: currentUser,
                        location: dayShifts[0]?.loc,
                        shiftCode: primaryShift
                      })}
                      className={`min-h-14 sm:min-h-20 p-1 sm:p-2 rounded-2xl border flex flex-col justify-between text-left transition-all hover:scale-102 active:scale-98 cursor-pointer ${
                        isToday
                          ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-400/30 shadow-xs'
                          : isOff
                          ? 'border-slate-200/80 bg-slate-50/60'
                          : 'border-slate-200 bg-white hover:border-blue-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-[10px] sm:text-xs font-black ${
                          isToday ? 'text-blue-700 bg-blue-100 px-1 rounded' : dayInfo.isSunday ? 'text-rose-600' : 'text-slate-800'
                        }`}>
                          {day}
                        </span>
                        {isToday && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 sm:hidden" />
                        )}
                      </div>

                      <div className="flex flex-col gap-1 mt-1 w-full">
                        {dayShifts.map(({ loc, shift }) => {
                          const isLibur = shift === 'L';
                          return (
                            <div
                              key={loc.id}
                              className={`w-full py-0.5 sm:py-1 px-1 rounded-lg text-center flex items-center justify-center gap-1 ${
                                isLibur
                                  ? 'bg-slate-100 text-slate-400 text-[9px]'
                                  : shift === 'P'
                                  ? 'bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-300'
                                  : shift === 'S'
                                  ? 'bg-sky-100 text-sky-800 font-extrabold border border-sky-300'
                                  : shift === 'M'
                                  ? 'bg-indigo-100 text-indigo-800 font-extrabold border border-indigo-300'
                                  : shift === 'P/M'
                                  ? 'bg-purple-100 text-purple-800 font-extrabold border border-purple-300'
                                  : 'bg-amber-100 text-amber-800 font-extrabold border border-amber-300'
                              }`}
                            >
                              <span className="text-[11px] sm:text-xs font-black leading-none">{shift}</span>
                              <span className="text-[9px] font-bold hidden sm:inline truncate">
                                {loc.kode || loc.nama}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 1: INPUT CEPAT HARIAN */}
      {viewMode === 'daily' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-3 border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-xs font-bold text-slate-700">Pilih Tanggal Dinas:</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {getDayInfo(selectedDay).fullName}, {selectedDay} {MONTH_NAMES[selectedMonth - 1]}
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1">
              {daysArray.map((day) => {
                const info = getDayInfo(day);
                const isSelected = selectedDay === day;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`flex flex-col items-center justify-center min-w-10 sm:min-w-11 py-2 rounded-2xl border transition-all shrink-0 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/20 scale-105'
                        : info.isSunday
                        ? 'border-rose-200 bg-rose-50/60 text-rose-700 hover:bg-rose-100/60'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="text-[10px] font-semibold leading-none">{info.shortName}</span>
                    <span className="text-sm font-extrabold leading-tight mt-0.5">{day}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pos / Lokasi Cards dengan Staf Terjadwal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locations.map((loc) => {
              const assignedMembers = getMembersForLocation(loc.id);
              return (
                <div key={loc.id} className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-4 h-4 rounded-full shadow-xs"
                        style={{ backgroundColor: loc.warna || '#10b981' }}
                      />
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">{loc.nama}</h3>
                        <p className="text-[11px] text-slate-500 font-medium">{loc.deskripsi || loc.alamat || 'Pos Jaga'}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {assignedMembers.length} Petugas Terdaftar
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {assignedMembers.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                        Belum ada petugas yang dipetakan ke lokasi ini.
                      </div>
                    ) : (
                      assignedMembers.map((mem) => {
                        const key = `${mem.id}_${loc.id}`;
                        const currentShift = schedules[key]?.[selectedDay] || 'L';

                        return (
                          <div
                            key={mem.id}
                            className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-3"
                          >
                            <div
                              onClick={() => setDetailModalData({
                                day: selectedDay,
                                member: mem,
                                location: loc,
                                shiftCode: currentShift
                              })}
                              className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-80"
                            >
                              <span className="text-xl">{mem.avatar}</span>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">
                                  {mem.namaLengkap || mem.nama}
                                </p>
                                <p className="text-[10px] text-slate-500 font-medium truncate">
                                  {mem.jabatan}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {shifts.map((s) => {
                                const isShiftSelected = currentShift === s.kode;
                                return (
                                  <button
                                    key={s.kode}
                                    onClick={() => updateSchedule(mem.id, loc.id, selectedDay, s.kode)}
                                    title={`${s.nama} (${s.jamMulai} - ${s.jamSelesai})`}
                                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                                      isShiftSelected
                                        ? s.kode === 'P'
                                          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30 font-black'
                                          : s.kode === 'S'
                                          ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-600/30 font-black'
                                          : s.kode === 'M'
                                          ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/30 font-black'
                                          : s.kode === 'L'
                                          ? 'bg-slate-600 text-white shadow-sm ring-2 ring-slate-600/30 font-black'
                                          : s.kode === 'P/M'
                                          ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-600/30 font-black'
                                          : 'bg-amber-600 text-white shadow-sm font-black'
                                        : 'bg-white border border-slate-200 hover:border-slate-300 text-slate-700'
                                    }`}
                                  >
                                    {s.kode}
                                  </button>
                                );
                              })}
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
      )}

      {/* MODE 2: KOTAK KALENDER */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Kalender Piket Seluruh Lokasi</h3>
              <p className="text-xs text-slate-500">Pilih pos/lokasi untuk memfilter tampilan:</p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setActiveLocationFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  activeLocationFilter === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Semua Pos
              </button>
              {locations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setActiveLocationFilter(loc.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    activeLocationFilter === loc.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {loc.nama}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {DAY_NAMES_SHORT.map((name, idx) => (
              <div
                key={name}
                className={`py-2 text-center text-xs font-bold rounded-xl ${
                  idx === 0 ? 'bg-rose-50 text-rose-600' : idx === 5 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {name}
              </div>
            ))}

            {Array.from({ length: new Date(selectedYear, selectedMonth - 1, 1).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-16 sm:min-h-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-100" />
            ))}

            {daysArray.map((day) => {
              const dayInfo = getDayInfo(day);
              const isToday = now.getDate() === day && now.getMonth() + 1 === selectedMonth && now.getFullYear() === selectedYear;

              const activeLocs = activeLocationFilter === 'all'
                ? locations
                : locations.filter(l => l.id === activeLocationFilter);

              let dutyList = [];
              activeLocs.forEach(loc => {
                const assigned = getMembersForLocation(loc.id);
                assigned.forEach(mem => {
                  const shift = schedules[`${mem.id}_${loc.id}`]?.[day] || 'L';
                  if (shift !== 'L') {
                    dutyList.push({ mem, loc, shift });
                  }
                });
              });

              return (
                <div
                  key={day}
                  onClick={() => {
                    setSelectedDay(day);
                    setViewMode('daily');
                  }}
                  className={`min-h-20 sm:min-h-24 p-1.5 sm:p-2 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all ${
                    isToday
                      ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-400/30'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black ${
                      isToday ? 'text-emerald-700' : dayInfo.isSunday ? 'text-rose-600' : 'text-slate-800'
                    }`}>
                      {day}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {dutyList.length} org
                    </span>
                  </div>

                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dutyList.slice(0, 3).map((item, idx) => (
                      <div
                        key={idx}
                        className="text-[10px] px-1 py-0.5 rounded-md bg-white border border-slate-200/80 text-slate-700 truncate flex items-center justify-between"
                      >
                        <span className="truncate">{item.mem.nama}</span>
                        <span className="font-extrabold text-emerald-700 ml-1">{item.shift}</span>
                      </div>
                    ))}
                    {dutyList.length > 3 && (
                      <span className="text-[9px] text-slate-400 block text-center font-bold">
                        +{dutyList.length - 3} lagi
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 3: PER PETUGAS */}
      {viewMode === 'member' && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Atur Jadwal Berdasarkan Petugas</h3>
              <p className="text-xs text-slate-500">Pilih petugas lalu klik tanggal untuk menandai shift:</p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {shifts.map((s) => (
                <button
                  key={s.kode}
                  onClick={() => setPainterShift(s.kode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    painterShift === s.kode
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{s.kode}</span>
                  <span className="font-normal text-[10px]">({s.nama})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {members.map((m) => {
              const isSelected = selectedMemberId === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMemberId(m.id)}
                  className={`px-3 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{m.avatar}</span>
                  <span>{m.nama}</span>
                </button>
              );
            })}
          </div>

          {(() => {
            const memberObj = members.find(m => m.id === selectedMemberId);
            const assignedLocs = locations.filter(loc => {
              if (memberObj?.assignedLocations) {
                return memberObj.assignedLocations.includes(loc.id);
              }
              return false;
            });

            return (
              <div className="space-y-4 pt-2">
                {assignedLocs.map((loc) => {
                  const key = `${selectedMemberId}_${loc.id}`;
                  return (
                    <div key={loc.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          Lokasi: {loc.nama}
                        </span>
                        <button
                          onClick={() => autoSchedule(selectedMemberId, loc.id)}
                          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-xl transition-all"
                        >
                          Terapkan Pola Otomatis (P-S-M-L)
                        </button>
                      </div>

                      <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 gap-1.5">
                        {daysArray.map((day) => {
                          const shift = schedules[key]?.[day] || 'L';
                          return (
                            <button
                              key={day}
                              onClick={() => updateSchedule(selectedMemberId, loc.id, day, painterShift)}
                              className={`p-2 rounded-xl text-center border transition-all ${
                                shift === 'P'
                                  ? 'bg-emerald-600 text-white font-bold border-emerald-600'
                                  : shift === 'S'
                                  ? 'bg-sky-600 text-white font-bold border-sky-600'
                                  : shift === 'M'
                                  ? 'bg-indigo-600 text-white font-bold border-indigo-600'
                                  : shift === 'L'
                                  ? 'bg-white border-slate-200 text-slate-400'
                                  : shift === 'P/M'
                                  ? 'bg-purple-600 text-white font-bold border-purple-600'
                                  : 'bg-amber-600 text-white font-bold border-amber-600'
                              }`}
                            >
                              <span className="text-[10px] block opacity-80">{day}</span>
                              <span className="text-xs font-black">{shift}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* MODE 4: TABEL MATRIKS */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Tabel Matriks Dinas Bulanan</h3>
            <span className="text-xs text-slate-500 font-medium">{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5 sticky left-0 bg-slate-100 z-10">Petugas</th>
                  <th className="p-2.5">Lokasi</th>
                  {daysArray.map(day => (
                    <th key={day} className="p-2 text-center min-w-8">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map(mem => {
                  const assignedLocs = locations.filter(loc => {
                    if (mem.assignedLocations) return mem.assignedLocations.includes(loc.id);
                    return false;
                  });

                  return assignedLocs.map(loc => {
                    const key = `${mem.id}_${loc.id}`;
                    return (
                      <tr key={key} className="hover:bg-slate-50 transition-all">
                        <td className="p-2.5 font-bold text-slate-900 sticky left-0 bg-white">
                          {mem.nama}
                        </td>
                        <td className="p-2.5 text-slate-600 font-semibold">{loc.nama}</td>
                        {daysArray.map(day => {
                          const shift = schedules[key]?.[day] || 'L';
                          return (
                            <td key={day} className="p-1 text-center">
                              <span className={`inline-block w-6 h-6 leading-6 rounded-lg text-center font-bold text-[11px] ${
                                shift === 'P' ? 'bg-emerald-100 text-emerald-800' :
                                shift === 'S' ? 'bg-sky-100 text-sky-800' :
                                shift === 'M' ? 'bg-indigo-100 text-indigo-800' :
                                shift === 'P/M' ? 'bg-purple-100 text-purple-800' :
                                shift === 'L' ? 'text-slate-300' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {shift}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Detail Informatif Piket (Admin) */}
      <ShiftDetailModal
        isOpen={Boolean(detailModalData)}
        onClose={() => setDetailModalData(null)}
        day={detailModalData?.day}
        member={detailModalData?.member}
        location={detailModalData?.location}
        shiftCode={detailModalData?.shiftCode}
        onOpenSwap={() => setActiveTab('monitoring')}
      />
    </div>
  );
};
