import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Filter, Sparkles, Share2, Download, ChevronLeft, ChevronRight, Check, MapPin, User, Zap, LayoutGrid, CalendarDays, Table, RefreshCw } from 'lucide-react';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const DAY_NAMES_SHORT = ['Mgg', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export const ScheduleView = () => {
  const {
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
    sendWebNotification
  } = useApp();

  // Mode Tampilan: 'daily' (Input Cepat Harian - Tanpa Geser), 'calendar' (Kotak Kalender 7 Kolom), 'member' (Per Petugas), 'table' (Tabel Matriks)
  const [viewMode, setViewMode] = useState('daily');

  // Selected Day for Daily Input (Default hari ini)
  const now = new Date();
  const [selectedDay, setSelectedDay] = useState(now.getDate());

  // Filter Lokasi
  const [activeLocationFilter, setActiveLocationFilter] = useState('all');

  // Selected Member for Member-centric input mode
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || '');
  const [painterShift, setPainterShift] = useState('P'); // Shift active in painter mode

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

  // Helper: Get only members assigned to a specific location
  const getMembersForLocation = (locationId) => {
    return members.filter(m => {
      // Check assignedLocations array on member
      if (m.assignedLocations && Array.isArray(m.assignedLocations)) {
        return m.assignedLocations.includes(locationId);
      }
      return false;
    });
  };

  // Share to WhatsApp
  const handleShareWhatsApp = () => {
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

  return (
    <div className="space-y-5 pb-28 animate-fade-in">
      {/* 1. Month Bar & Mode Switcher (Cerah, Bersih, Menarik) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Month Selector */}
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

        {/* View Mode Tabs (Canggih & Fleksibel) */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl w-full sm:w-auto overflow-x-auto">
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
          onClick={handleShareWhatsApp}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Share2 className="w-3.5 h-3.5" />
          Kirim ke WA
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: INPUT CEPAT HARIAN (TIDAK PERLU GESER KESAMPING - 1 TAP ENTRI)    */}
      {/* ========================================================================= */}
      {viewMode === 'daily' && (
        <div className="space-y-4">
          {/* Horizontal Day Selector Pills (Sangat mudah memilih hari) */}
          <div className="bg-white rounded-3xl p-3 border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-xs font-bold text-slate-700">Pilih Tanggal Dinas:</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {getDayInfo(selectedDay).fullName}, {selectedDay} {MONTH_NAMES[selectedMonth - 1]}
              </span>
            </div>

            {/* Scrollable Day Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1">
              {daysArray.map(day => {
                const info = getDayInfo(day);
                const isSelected = day === selectedDay;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`flex flex-col items-center justify-center min-w-[44px] h-14 rounded-2xl transition-all border shrink-0 ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105 font-black'
                        : info.isSunday
                        ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-[10px] font-medium opacity-80">{info.shortName}</span>
                    <span className="text-sm font-bold mt-0.5">{day}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Shift Palette Reminder */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-50/70 p-2.5 rounded-2xl border border-emerald-100 text-xs">
            <span className="font-semibold text-emerald-900 text-[11px] flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              Ketuk satu tombol shift di bawah untuk langsung mengganti dinas:
            </span>
            <div className="flex items-center gap-1 text-[10px]">
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">P: Pagi</span>
              <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 border border-sky-300 font-bold">S: Siang</span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-300 font-bold">M: Malam</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-300 font-bold">L: Libur</span>
            </div>
          </div>

          {/* Location Cards with ONLY Designated Members */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locations.map(loc => {
              const assignedMembers = getMembersForLocation(loc.id);

              return (
                <div
                  key={loc.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden"
                >
                  {/* Top Color Line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: loc.warna }}
                  />

                  {/* Location Header */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: loc.warna }}
                      />
                      <h3 className="text-base font-bold text-slate-900">{loc.nama}</h3>
                      <span className="text-[11px] text-slate-500 font-medium">({loc.deskripsi})</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      {assignedMembers.length} Petugas Khusus
                    </span>
                  </div>

                  {/* List of Designated Members & 1-Tap Shift Buttons */}
                  <div className="space-y-3">
                    {assignedMembers.map(member => {
                      const key = `${member.id}_${loc.id}`;
                      const currentShift = schedules[key]?.[selectedDay] || 'L';

                      return (
                        <div
                          key={member.id}
                          className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all hover:bg-slate-100/60"
                        >
                          {/* Member Info */}
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{member.avatar}</span>
                            <div>
                              <p className="text-xs font-bold text-slate-900 leading-tight">
                                {member.namaLengkap || member.nama}
                              </p>
                              <p className="text-[10px] text-slate-500 font-medium">
                                {member.jabatan}
                              </p>
                            </div>
                          </div>

                          {/* 1-Tap Shift Picker Buttons (Super Fast!) */}
                          <div className="flex items-center gap-1 justify-end">
                            {['P', 'S', 'M', 'L'].map(code => {
                              const isCurrent = currentShift === code;
                              let btnClass = 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100';

                              if (isCurrent) {
                                if (code === 'P') btnClass = 'bg-emerald-600 text-white border-emerald-600 font-black shadow-sm';
                                else if (code === 'S') btnClass = 'bg-sky-600 text-white border-sky-600 font-black shadow-sm';
                                else if (code === 'M') btnClass = 'bg-indigo-600 text-white border-indigo-600 font-black shadow-sm';
                                else if (code === 'L') btnClass = 'bg-slate-500 text-white border-slate-500 font-black shadow-sm';
                              }

                              return (
                                <button
                                  key={code}
                                  onClick={() => updateSchedule(member.id, loc.id, selectedDay, code)}
                                  className={`w-8 h-8 rounded-xl text-xs font-bold border transition-all active:scale-90 flex items-center justify-center ${btnClass}`}
                                  title={`Pilih shift ${code}`}
                                >
                                  {code}
                                </button>
                              );
                            })}

                            {/* Dropdown for double shifts (P/S, S/M, PSM) */}
                            <select
                              value={['P/S', 'S/M', 'PSM'].includes(currentShift) ? currentShift : ''}
                              onChange={(e) => {
                                if (e.target.value) {
                                  updateSchedule(member.id, loc.id, selectedDay, e.target.value);
                                }
                              }}
                              className="h-8 px-1 rounded-xl text-[10px] font-bold bg-white border border-slate-200 text-slate-700 focus:outline-none"
                              title="Shift Lainnya"
                            >
                              <option value="">Lainnya</option>
                              <option value="P/S">P/S</option>
                              <option value="S/M">S/M</option>
                              <option value="PSM">PSM</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Date Stepper at Bottom */}
          <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <button
              onClick={() => setSelectedDay(d => Math.max(1, d - 1))}
              disabled={selectedDay === 1}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs flex items-center gap-1 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Kemarin (Tgl {selectedDay - 1})
            </button>

            <span className="text-xs font-bold text-slate-600">
              Hari {selectedDay} dari {daysInMonth}
            </span>

            <button
              onClick={() => setSelectedDay(d => Math.min(daysInMonth, d + 1))}
              disabled={selectedDay === daysInMonth}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs flex items-center gap-1 transition-all"
            >
              Besok (Tgl {selectedDay + 1})
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: KALENDER KOTAK 7 KOLOM (100% FIT DI LAYAR HP TANPA GESER KESAMPING) */}
      {/* ========================================================================= */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-emerald-600" />
              Kalender Bulanan (Ketuk tanggal untuk melihat & mengubah jadwal)
            </h3>
            <select
              value={activeLocationFilter}
              onChange={(e) => setActiveLocationFilter(e.target.value)}
              className="bg-slate-100 border border-slate-300 text-slate-800 rounded-xl px-2.5 py-1 text-xs font-semibold focus:outline-none"
            >
              <option value="all">Semua Pos Lokasi</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.nama}</option>
              ))}
            </select>
          </div>

          {/* 7 Columns Grid (Minggu s/d Sabtu) */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((h, i) => (
              <div
                key={h}
                className={`py-1 text-xs font-bold ${
                  i === 0 ? 'text-rose-600 bg-rose-50 rounded-lg' : 'text-slate-500'
                }`}
              >
                {h}
              </div>
            ))}

            {/* Empty offset for first day of month */}
            {Array.from({ length: new Date(selectedYear, selectedMonth - 1, 1).getDay() }).map((_, i) => (
              <div key={'empty-' + i} className="h-16 rounded-xl bg-slate-50/40 border border-transparent" />
            ))}

            {/* Days 1..31 Grid */}
            {daysArray.map(day => {
              const isSelected = day === selectedDay;
              const isSun = new Date(selectedYear, selectedMonth - 1, day).getDay() === 0;

              // Count duty count for this day
              let dutyStaff = [];
              locations.forEach(loc => {
                if (activeLocationFilter === 'all' || activeLocationFilter === loc.id) {
                  const assigned = getMembersForLocation(loc.id);
                  assigned.forEach(m => {
                    const shift = schedules[`${m.id}_${loc.id}`]?.[day];
                    if (shift && shift !== 'L') {
                      dutyStaff.push({ member: m, loc, shift });
                    }
                  });
                }
              });

              return (
                <div
                  key={day}
                  onClick={() => {
                    setSelectedDay(day);
                    setViewMode('daily'); // Switch to daily input for instant easy editing!
                  }}
                  className={`h-16 sm:h-20 p-1 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all hover:border-emerald-500 hover:shadow-md ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30'
                      : isSun
                      ? 'bg-rose-50/50 border-rose-200/60'
                      : 'bg-white border-slate-200'
                  }`}
                  title={`Klik untuk edit tanggal ${day}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isSun ? 'text-rose-600' : 'text-slate-800'}`}>
                      {day}
                    </span>
                    {dutyStaff.length > 0 && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-600 text-white">
                        {dutyStaff.length}
                      </span>
                    )}
                  </div>

                  {/* Mini badges */}
                  <div className="space-y-0.5 overflow-hidden">
                    {dutyStaff.slice(0, 2).map((item, idx) => (
                      <div
                        key={idx}
                        className="text-[9px] font-bold px-1 py-0.2 rounded bg-slate-100 text-slate-700 truncate text-left"
                      >
                        {item.member.nama}: <span className="text-emerald-700">{item.shift}</span>
                      </div>
                    ))}
                    {dutyStaff.length > 2 && (
                      <p className="text-[8px] text-slate-400 font-bold">+{dutyStaff.length - 2} lagi</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: JADWAL PER PETUGAS (SHIFT PAINTER & POLA ROTASI CEPAT)            */}
      {/* ========================================================================= */}
      {viewMode === 'member' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                Input Jadwal Khusus per Petugas
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih petugas, pilih warna shift, lalu ketuk tanggal-tanggal untuk menandai langsung.
              </p>
            </div>

            {/* Member Selector */}
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.avatar} {m.namaLengkap || m.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Member's Designated Locations */}
          {(() => {
            const currentMem = members.find(m => m.id === selectedMemberId);
            const assignedLocs = locations.filter(l => currentMem?.assignedLocations?.includes(l.id));

            return (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{currentMem?.avatar}</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{currentMem?.namaLengkap || currentMem?.nama}</h4>
                      <p className="text-[11px] text-slate-600">
                        Lokasi Dinas Khusus: <span className="font-bold text-emerald-800">{assignedLocs.map(l => l.nama).join(', ') || 'Belum ditentukan'}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shift Painter Palette Tool */}
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-700">Kuas Shift:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {shifts.map(s => (
                      <button
                        key={s.kode}
                        onClick={() => setPainterShift(s.kode)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                          painterShift === s.kode
                            ? 'ring-2 ring-emerald-500 scale-105 shadow-sm ' + s.bgClass
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {s.kode}: {s.nama}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compact Calendar Grid for Each of this Member's Assigned Locations */}
                {assignedLocs.map(loc => {
                  const key = `${selectedMemberId}_${loc.id}`;
                  const rowSchedule = schedules[key] || {};

                  return (
                    <div key={loc.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: loc.warna }} />
                          <h5 className="text-xs font-bold text-slate-900">{loc.nama} ({loc.deskripsi})</h5>
                        </div>
                        <button
                          onClick={() => autoSchedule(selectedMemberId, loc.id, ['P', 'S', 'M', 'L', 'L'])}
                          className="px-3 py-1 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold border border-emerald-300 flex items-center gap-1 transition-all"
                        >
                          <Sparkles className="w-3 h-3" />
                          Auto-Rotasi P-S-M-L-L
                        </button>
                      </div>

                      {/* 31 Days Compact Grid (Fit 100% on phone, no horizontal scroll) */}
                      <div className="grid grid-cols-7 sm:grid-cols-11 gap-1.5 text-center">
                        {daysArray.map(day => {
                          const shiftCode = rowSchedule[day] || 'L';
                          const shiftObj = shifts.find(s => s.kode === shiftCode) || {
                            bgClass: 'bg-slate-100 text-slate-500 border-slate-200'
                          };

                          return (
                            <button
                              key={day}
                              onClick={() => updateSchedule(selectedMemberId, loc.id, day, painterShift)}
                              className={`p-1.5 rounded-xl border text-center transition-all active:scale-90 hover:shadow-sm ${shiftObj.bgClass}`}
                              title={`Tgl ${day}: ${shiftCode} (Ketuk untuk ubah ke ${painterShift})`}
                            >
                              <p className="text-[10px] text-slate-500 font-bold leading-tight">{day}</p>
                              <p className="text-xs font-black mt-0.5 leading-tight">{shiftCode}</p>
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

      {/* ========================================================================= */}
      {/* MODE 4: TABEL MATRIKS LENGKAP                                            */}
      {/* ========================================================================= */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 font-semibold flex items-center justify-between">
            <span>Tabel Matriks Dinas (Daftar Petugas Sesuai Pos Ditentukan)</span>
            <span className="text-[11px] text-emerald-700 font-bold">Ketuk sel untuk mengganti shift</span>
          </div>

          <div className="overflow-x-auto max-w-full">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] text-slate-600 font-bold">
                  <th className="sticky left-0 z-30 bg-slate-100 px-3 py-2.5 text-left font-bold text-slate-800 border-r border-slate-200 min-w-[130px] shadow-sm">
                    Petugas & Pos
                  </th>
                  {daysArray.map(day => (
                    <th key={day} className="px-1.5 py-2 min-w-[32px] border-r border-slate-200 text-xs font-bold">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {members.map(member => {
                  const assignedLocs = locations.filter(l => member.assignedLocations?.includes(l.id));

                  return assignedLocs.map(loc => {
                    const key = `${member.id}_${loc.id}`;
                    const rowSchedule = schedules[key] || {};

                    return (
                      <tr key={key} className="hover:bg-slate-50 transition-colors">
                        <td className="sticky left-0 z-20 bg-white px-3 py-2 text-left border-r border-slate-200 shadow-sm">
                          <p className="font-bold text-slate-900 text-xs truncate max-w-[120px]">
                            {member.nama}
                          </p>
                          <span
                            className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold mt-0.5"
                            style={{ backgroundColor: `${loc.warna}20`, color: loc.warna }}
                          >
                            {loc.nama}
                          </span>
                        </td>

                        {daysArray.map(day => {
                          const shiftCode = rowSchedule[day] || 'L';
                          const shiftObj = shifts.find(s => s.kode === shiftCode) || {
                            bgClass: 'bg-slate-100 text-slate-500'
                          };

                          return (
                            <td
                              key={day}
                              onClick={() => {
                                // Cycle to next shift on tap: P -> S -> M -> L -> P
                                const cycle = { P: 'S', S: 'M', M: 'L', L: 'P' };
                                const next = cycle[shiftCode] || 'P';
                                updateSchedule(member.id, loc.id, day, next);
                              }}
                              className="p-1 border-r border-slate-100 cursor-pointer select-none active:scale-90"
                              title={`Tgl ${day}: ${shiftCode} (Ketuk untuk ganti)`}
                            >
                              <span className={`inline-block w-6 h-6 leading-6 text-[11px] font-black rounded-lg border text-center ${shiftObj.bgClass}`}>
                                {shiftCode}
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
    </div>
  );
};
