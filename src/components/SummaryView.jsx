import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, Moon, Coffee, Award } from 'lucide-react';

export const SummaryView = () => {
  const { members, locations, schedules, selectedMonth, selectedYear } = useApp();

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  const memberStats = members.map(mem => {
    let pagi = 0;
    let siang = 0;
    let malam = 0;
    let libur = 0;
    let doubleShift = 0;

    const assignedLocs = locations.filter(l => mem.assignedLocations?.includes(l.id));

    assignedLocs.forEach(loc => {
      const key = `${mem.id}_${loc.id}`;
      const row = schedules[key] || {};
      for (let d = 1; d <= daysInMonth; d++) {
        const shift = row[d] || 'L';
        if (shift === 'P') pagi++;
        else if (shift === 'S') siang++;
        else if (shift === 'M') malam++;
        else if (shift === 'L') libur++;
        else doubleShift++;
      }
    });

    const totalDinas = pagi + siang + malam + doubleShift;

    return {
      ...mem,
      assignedLocs,
      pagi,
      siang,
      malam,
      libur,
      doubleShift,
      totalDinas
    };
  });

  const sortedByDinas = [...memberStats].sort((a, b) => b.totalDinas - a.totalDinas);
  const mostNight = [...memberStats].sort((a, b) => b.malam - a.malam)[0];

  return (
    <div className="space-y-6 pb-28 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          Rekapitulasi Shift & Beban Kerja Petugas
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Statistik dinas riil seluruh petugas piket berdasarkan pos yang sudah ditentukan pada Google Sheet.
        </p>
      </div>

      {/* Highlights Cards (Cerah) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-4 border border-emerald-200 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Dinas Terbanyak</p>
            <h4 className="text-sm font-bold text-slate-900">{sortedByDinas[0]?.namaLengkap || sortedByDinas[0]?.nama}</h4>
            <p className="text-xs text-emerald-700 font-black">{sortedByDinas[0]?.totalDinas} Hari Shift</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-indigo-200 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0">
            <Moon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Shift Malam Terbanyak</p>
            <h4 className="text-sm font-bold text-slate-900">{mostNight?.namaLengkap || mostNight?.nama}</h4>
            <p className="text-xs text-indigo-700 font-black">{mostNight?.malam} Kali Malam</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex items-center gap-3 sm:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Rata-Rata Libur</p>
            <h4 className="text-sm font-bold text-slate-900">
              {Math.round(memberStats.reduce((acc, m) => acc + m.libur, 0) / (memberStats.length || 1))} Hari / Petugas
            </h4>
            <p className="text-xs text-slate-500 font-medium">Dari {daysInMonth} Hari</p>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600 font-bold">
                <th className="px-4 py-3">Nama Petugas</th>
                <th className="px-3 py-3">Pos Lokasi</th>
                <th className="px-3 py-3 text-center text-emerald-700">Pagi (P)</th>
                <th className="px-3 py-3 text-center text-sky-700">Siang (S)</th>
                <th className="px-3 py-3 text-center text-indigo-700">Malam (M)</th>
                <th className="px-3 py-3 text-center text-slate-500">Libur (L)</th>
                <th className="px-3 py-3 text-center text-amber-700">Kombinasi</th>
                <th className="px-4 py-3 text-right font-black text-slate-900">Total Dinas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {memberStats.map((stat) => (
                <tr key={stat.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{stat.avatar}</span>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{stat.namaLengkap || stat.nama}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{stat.jabatan}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {stat.assignedLocs.map(l => (
                        <span
                          key={l.id}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold"
                          style={{ backgroundColor: `${l.warna}15`, color: l.warna }}
                        >
                          {l.nama}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-emerald-700">{stat.pagi}</td>
                  <td className="px-3 py-3 text-center font-bold text-sky-700">{stat.siang}</td>
                  <td className="px-3 py-3 text-center font-bold text-indigo-700">{stat.malam}</td>
                  <td className="px-3 py-3 text-center font-bold text-slate-500">{stat.libur}</td>
                  <td className="px-3 py-3 text-center font-bold text-amber-700">{stat.doubleShift}</td>
                  <td className="px-4 py-3 text-right font-black">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-black">
                      {stat.totalDinas} Hari
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
