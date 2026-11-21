import React from 'react';
import { useApp } from '../context/AppContext';
import { CalendarDays, Activity, MapPin, BarChart3, Settings } from 'lucide-react';

export const BottomNav = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems = [
    { id: 'schedule', label: 'Jadwal', icon: CalendarDays },
    { id: 'monitoring', label: 'Monitoring', icon: Activity },
    { id: 'locations', label: 'Lokasi', icon: MapPin },
    { id: 'summary', label: 'Rekap', icon: BarChart3 },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 p-3 pb-safe pointer-events-none">
      <div className="max-w-md mx-auto bg-white/95 backdrop-blur-xl rounded-3xl p-1.5 flex items-center justify-around pointer-events-auto shadow-xl border border-slate-200/90 shadow-slate-900/10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-emerald-700 font-extrabold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              {isActive && (
                <span className="absolute inset-0 bg-emerald-50 rounded-2xl border border-emerald-200 animate-fade-in" />
              )}
              <Icon className={`w-5 h-5 transition-transform duration-200 relative z-10 ${isActive ? 'scale-110 text-emerald-600' : ''}`} />
              <span className="text-[10px] mt-1 tracking-tight relative z-10">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
