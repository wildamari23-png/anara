import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Bell, CheckCheck, Clock } from 'lucide-react';

export const NotificationModal = ({ isOpen, onClose }) => {
  const { notifications, markAllNotificationsRead } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Pusat Notifikasi</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={markAllNotificationsRead}
              className="p-1.5 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-slate-100 text-xs flex items-center gap-1"
              title="Tandai Sudah Dibaca"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-2xl border transition-all text-xs ${
                  n.read
                    ? 'bg-slate-50 border-slate-200 text-slate-600'
                    : 'bg-emerald-50/60 border-emerald-200 text-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-bold text-slate-900 text-xs">{n.title}</h4>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0 font-medium">
                    <Clock className="w-3 h-3" />
                    {n.time}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{n.body}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">Tidak ada notifikasi baru.</p>
          )}
        </div>
      </div>
    </div>
  );
};
