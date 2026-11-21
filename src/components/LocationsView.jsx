import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Plus, Edit2, Trash2, Users } from 'lucide-react';

const COLOR_PALETTE = [
  '#10b981', // Emerald
  '#0284c7', // Sky Blue
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#ef4444', // Red
  '#14b8a6', // Teal
  '#6366f1', // Indigo
];

export const LocationsView = () => {
  const { locations, addLocation, updateLocation, deleteLocation, members, currentUser } = useApp();
  const [editingLoc, setEditingLoc] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const [form, setForm] = useState({
    nama: '',
    kode: '',
    deskripsi: '',
    alamat: '',
    warna: '#10b981',
    kuotaPagi: 2,
    kuotaSiang: 2,
    kuotaMalam: 1
  });

  const handleOpenCreate = () => {
    setForm({
      nama: '',
      kode: '',
      deskripsi: '',
      alamat: '',
      warna: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)],
      kuotaPagi: 2,
      kuotaSiang: 2,
      kuotaMalam: 1
    });
    setIsCreating(true);
    setEditingLoc(null);
  };

  const handleOpenEdit = (loc) => {
    setForm({ ...loc });
    setEditingLoc(loc);
    setIsCreating(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.nama) return;

    if (isCreating) {
      addLocation({
        ...form,
        kode: form.kode || form.nama.toUpperCase().replace(/\s+/g, '')
      });
      setIsCreating(false);
    } else if (editingLoc) {
      updateLocation(editingLoc.id, form);
      setEditingLoc(null);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="space-y-6 pb-28 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            Pengaturan & Pos Lokasi Piket
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data pos piket dinas, petugas yang ditentukan, dan kuota shift harian.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-900/10 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Tambah Lokasi Baru
          </button>
        )}
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locations.map((loc) => {
          const assignedMembers = members.filter(m => m.assignedLocations?.includes(loc.id));

          return (
            <div
              key={loc.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: loc.warna }}
              />

              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm"
                    style={{
                      backgroundColor: `${loc.warna}15`,
                      color: loc.warna,
                      border: `1px solid ${loc.warna}30`
                    }}
                  >
                    {loc.kode || loc.nama.substring(0, 3)}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">{loc.nama}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{loc.deskripsi || 'Pos Pelayanan Dinas'}</p>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(loc)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                      title="Edit Lokasi"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {locations.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus lokasi "${loc.nama}"?`)) {
                            deleteLocation(loc.id);
                          }
                        }}
                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all"
                        title="Hapus Lokasi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Designated Personnel */}
              <div className="mb-4 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  Petugas Ditentukan di Pos Ini:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {assignedMembers.length > 0 ? (
                    assignedMembers.map(m => (
                      <span
                        key={m.id}
                        className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-800 shadow-2xs"
                      >
                        {m.avatar} {m.nama}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">Belum ada petugas ditentukan</span>
                  )}
                </div>
              </div>

              {/* Quotas */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                <div className="p-2 rounded-2xl bg-emerald-50/70 border border-emerald-200/60">
                  <p className="text-[10px] text-emerald-800 font-bold">Pagi (P)</p>
                  <p className="text-sm font-black text-emerald-900 mt-0.5">{loc.kuotaPagi ?? 2} Org</p>
                </div>
                <div className="p-2 rounded-2xl bg-sky-50/70 border border-sky-200/60">
                  <p className="text-[10px] text-sky-800 font-bold">Siang (S)</p>
                  <p className="text-sm font-black text-sky-900 mt-0.5">{loc.kuotaSiang ?? 2} Org</p>
                </div>
                <div className="p-2 rounded-2xl bg-indigo-50/70 border border-indigo-200/60">
                  <p className="text-[10px] text-indigo-800 font-bold">Malam (M)</p>
                  <p className="text-sm font-black text-indigo-900 mt-0.5">{loc.kuotaMalam ?? 1} Org</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
