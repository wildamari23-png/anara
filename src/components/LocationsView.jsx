import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Users,
  Shield,
  ArrowRightLeft,
  Check,
  X,
  History,
  RotateCcw,
  Sparkles,
  Building,
  CheckCircle2,
  AlertTriangle,
  Info,
  UserCheck
} from 'lucide-react';
import { MemberEditModal } from './MemberEditModal';

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
  const {
    locations,
    addLocation,
    updateLocation,
    deleteLocation,
    reassignMemberLocation,
    members,
    currentUser
  } = useApp();

  const isAdmin = currentUser?.role === 'admin';

  // Active Sub-tab: 'locations' (Daftar Pos) or 'members' (Penempatan Petugas)
  const [activeSubTab, setActiveSubTab] = useState('locations');

  // State for Add/Edit Location Modal
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [locForm, setLocForm] = useState({
    nama: '',
    kode: '',
    deskripsi: '',
    alamat: '',
    warna: '#10b981',
    kuotaPagi: 2,
    kuotaSiang: 2,
    kuotaMalam: 1,
    assignedMemberIds: []
  });

  // State for Member Reassign Modal (Pindah Penempatan Lokasi)
  const [reassignMember, setReassignMember] = useState(null);
  const [selectedLocIds, setSelectedLocIds] = useState([]);
  const [resetOption, setResetOption] = useState('keep'); // 'keep' (Tetap) | 'reset' (Reset)
  const [isSaving, setIsSaving] = useState(false);

  // State for Member Setup / Edit Profile Modal (Admin)
  const [editingMember, setEditingMember] = useState(null);
  const [isCreatingMember, setIsCreatingMember] = useState(false);

  // Open Create Location Modal
  const handleOpenCreate = () => {
    setLocForm({
      nama: '',
      kode: '',
      deskripsi: '',
      alamat: '',
      warna: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)],
      kuotaPagi: 2,
      kuotaSiang: 2,
      kuotaMalam: 1,
      assignedMemberIds: []
    });
    setSelectedLoc(null);
    setModalMode('create');
  };

  // Open Edit Location Modal
  const handleOpenEdit = (loc) => {
    const currentAssigned = members
      .filter(m => m.assignedLocations?.includes(loc.id))
      .map(m => m.id);

    setLocForm({
      nama: loc.nama || '',
      kode: loc.kode || '',
      deskripsi: loc.deskripsi || '',
      alamat: loc.alamat || '',
      warna: loc.warna || '#10b981',
      kuotaPagi: loc.kuotaPagi ?? 2,
      kuotaSiang: loc.kuotaSiang ?? 2,
      kuotaMalam: loc.kuotaMalam ?? 1,
      assignedMemberIds: currentAssigned
    });
    setSelectedLoc(loc);
    setModalMode('edit');
  };

  // Save Location (Create or Edit)
  const handleSaveLocation = (e) => {
    e.preventDefault();
    if (!locForm.nama.trim()) {
      alert('Nama lokasi pos tidak boleh kosong.');
      return;
    }

    if (modalMode === 'create') {
      const newLoc = addLocation({
        nama: locForm.nama.trim(),
        kode: locForm.kode.trim() || locForm.nama.substring(0, 4).toUpperCase(),
        deskripsi: locForm.deskripsi.trim(),
        alamat: locForm.alamat.trim(),
        warna: locForm.warna,
        kuotaPagi: Number(locForm.kuotaPagi) || 2,
        kuotaSiang: Number(locForm.kuotaSiang) || 2,
        kuotaMalam: Number(locForm.kuotaMalam) || 1
      });

      // Update assigned members for this newly created location
      locForm.assignedMemberIds.forEach(memId => {
        const mem = members.find(m => m.id === memId);
        if (mem) {
          const currentLocs = mem.assignedLocations || [];
          if (!currentLocs.includes(newLoc.id)) {
            reassignMemberLocation(memId, [...currentLocs, newLoc.id], 'keep');
          }
        }
      });
    } else if (modalMode === 'edit' && selectedLoc) {
      updateLocation(selectedLoc.id, {
        nama: locForm.nama.trim(),
        kode: locForm.kode.trim() || locForm.nama.substring(0, 4).toUpperCase(),
        deskripsi: locForm.deskripsi.trim(),
        alamat: locForm.alamat.trim(),
        warna: locForm.warna,
        kuotaPagi: Number(locForm.kuotaPagi) || 2,
        kuotaSiang: Number(locForm.kuotaSiang) || 2,
        kuotaMalam: Number(locForm.kuotaMalam) || 1
      });

      // Synchronize members assigned to this location
      members.forEach(mem => {
        const isSelected = locForm.assignedMemberIds.includes(mem.id);
        const currentLocs = mem.assignedLocations || [];
        const hasLoc = currentLocs.includes(selectedLoc.id);

        if (isSelected && !hasLoc) {
          // Add this location to member
          reassignMemberLocation(mem.id, [...currentLocs, selectedLoc.id], 'keep');
        } else if (!isSelected && hasLoc) {
          // Remove this location from member
          reassignMemberLocation(mem.id, currentLocs.filter(id => id !== selectedLoc.id), 'keep');
        }
      });
    }

    setModalMode(null);
    setSelectedLoc(null);
  };

  // Open Reassign Member Modal
  const handleOpenReassign = (member) => {
    setReassignMember(member);
    setSelectedLocIds(member.assignedLocations || []);
    setResetOption('keep');
  };

  // Save Reassign Member Location
  const handleSaveReassign = () => {
    if (!reassignMember) return;
    if (selectedLocIds.length === 0) {
      alert('Pilih minimal 1 pos lokasi penugasan untuk petugas ini.');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      reassignMemberLocation(reassignMember.id, selectedLocIds, resetOption);
      setIsSaving(false);
      setReassignMember(null);
    }, 200);
  };

  // Toggle member in location form
  const handleToggleMemberInLocForm = (memId) => {
    setLocForm(prev => {
      const exists = prev.assignedMemberIds.includes(memId);
      return {
        ...prev,
        assignedMemberIds: exists
          ? prev.assignedMemberIds.filter(id => id !== memId)
          : [...prev.assignedMemberIds, memId]
      };
    });
  };

  // Toggle location in reassign member modal
  const handleToggleLocInReassign = (locId) => {
    setSelectedLocIds(prev => {
      const exists = prev.includes(locId);
      return exists ? prev.filter(id => id !== locId) : [...prev, locId];
    });
  };

  return (
    <div className="space-y-6 pb-28 animate-fade-in">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            Manajemen Lokasi & Penempatan Petugas
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Atur data pos dinas, edit lokasi, dan tentukan penempatan petugas dengan opsi riwayat jadwal.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-900/10 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Lokasi Baru</span>
          </button>
        )}
      </div>

      {/* Sub Tabs: Pos Lokasi vs Penempatan Petugas */}
      <div className="flex items-center p-1.5 bg-slate-100 rounded-2xl w-full sm:w-auto">
        <button
          onClick={() => setActiveSubTab('locations')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'locations'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Daftar Pos & Kuota Dinas ({locations.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('members')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'members'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Penempatan Petugas / Mutasi Pos ({members.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DAFTAR POS & KUOTA DINAS                                          */}
      {/* ========================================================================= */}
      {activeSubTab === 'locations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locations.map((loc) => {
            const assignedMembers = members.filter(m => m.assignedLocations?.includes(loc.id));

            return (
              <div
                key={loc.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all relative overflow-hidden space-y-4"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: loc.warna || '#10b981' }}
                />

                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shadow-xs shrink-0"
                      style={{
                        backgroundColor: `${loc.warna}18`,
                        color: loc.warna,
                        border: `1.5px solid ${loc.warna}40`
                      }}
                    >
                      {loc.kode || loc.nama.substring(0, 3)}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">{loc.nama}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{loc.deskripsi || 'Pos Pelayanan Dinas'}</p>
                      {loc.alamat && (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{loc.alamat}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(loc)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 transition-all"
                        title="Edit Lokasi & Petugas"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {locations.length > 1 && (
                        <button
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus pos "${loc.nama}"? Petugas di pos ini akan dipindahkan.`)) {
                              deleteLocation(loc.id);
                            }
                          }}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-all"
                          title="Hapus Lokasi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Petugas Ditentukan di Pos Ini */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      Petugas Ditugaskan di Pos Ini ({assignedMembers.length}):
                    </p>
                    {isAdmin && (
                      <button
                        onClick={() => handleOpenEdit(loc)}
                        className="text-[10px] font-bold text-emerald-700 hover:underline"
                      >
                        + Atur Petugas
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {assignedMembers.length > 0 ? (
                      assignedMembers.map(m => (
                        <span
                          key={m.id}
                          className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs flex items-center gap-1.5"
                        >
                          <span>{m.avatar}</span>
                          <span>{m.nama}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Belum ada petugas ditentukan di pos ini</span>
                    )}
                  </div>
                </div>

                {/* Kuota Shift */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                  <div className="p-2 rounded-2xl bg-emerald-50/70 border border-emerald-200/60">
                    <p className="text-[10px] text-emerald-800 font-bold">Pagi (P)</p>
                    <p className="text-sm font-black text-emerald-900 mt-0.5">{loc.kuotaPagi ?? 2} Org</p>
                  </div>
                  <div className="bg-sky-50/70 border border-sky-200/60 p-2 rounded-2xl">
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
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PENEMPATAN PETUGAS / MUTASI POS (CANGGIH DENGAN PILIHAN RIWAYAT)  */}
      {/* ========================================================================= */}
      {activeSubTab === 'members' && (
        <div className="space-y-4">
          <div className="bg-blue-50/70 border border-blue-200 rounded-3xl p-4 text-xs text-blue-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Manajemen Penempatan & Mutasi Petugas Piket</p>
              <p className="text-blue-800 mt-0.5">
                Anda dapat memindahkan penempatan pos dinas setiap petugas. Saat lokasi dipindahkan, Anda dapat memilih
                apakah <strong>riwayat jadwal lama tetap dipertahankan</strong> sebagai arsip atau <strong>dibersihkan / di-reset</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pb-1">
            <p className="text-xs font-bold text-slate-700">Daftar Petugas Piket ({members.length}):</p>
            {isAdmin && (
              <button
                onClick={() => setIsCreatingMember(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Petugas Baru</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((mem) => {
              const assignedLocs = locations.filter(l => mem.assignedLocations?.includes(l.id));

              return (
                <div
                  key={mem.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shadow-xs shrink-0">
                        {mem.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{mem.namaLengkap || mem.nama}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            mem.role === 'admin'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {mem.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{mem.jabatan}</p>
                        {mem.noHp && (
                          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{mem.noHp}</p>
                        )}
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setEditingMember(mem)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 text-xs font-bold flex items-center gap-1 transition-all"
                          title="Edit Nama, Profil, Password & Hak Akses"
                        >
                          <Edit2 className="w-3 h-3 text-slate-500" />
                          <span className="hidden sm:inline">Edit Data</span>
                        </button>
                        <button
                          onClick={() => handleOpenReassign(mem)}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-1 transition-all shadow-2xs"
                          title="Pindah / Mutasi Pos Lokasi"
                        >
                          <ArrowRightLeft className="w-3 h-3 text-emerald-600" />
                          <span>Pindah Pos</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Lokasi Penugasan Saat Ini */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-[11px] font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      Pos Penempatan Saat Ini:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {assignedLocs.length > 0 ? (
                        assignedLocs.map(loc => (
                          <span
                            key={loc.id}
                            className="px-2.5 py-1 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1"
                            style={{ backgroundColor: loc.warna || '#10b981' }}
                          >
                            <Building className="w-3 h-3" />
                            <span>{loc.nama}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-rose-600 font-medium italic">
                          Belum ditempatkan di pos manapun
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: FORM TAMBAH & EDIT LOKASI POS                                    */}
      {/* ========================================================================= */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {modalMode === 'create' ? 'Tambah Pos Lokasi Baru' : `Edit Pos: ${selectedLoc?.nama}`}
                  </h3>
                  <p className="text-xs text-slate-500">Isi data pos dinas & tentukan petugas yang bertugas</p>
                </div>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Pos / Fasilitas:*</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: RSJ, RS TK IV"
                    value={locForm.nama}
                    onChange={(e) => setLocForm({ ...locForm, nama: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode Singkat:*</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: RSJ, RSTK4"
                    value={locForm.kode}
                    onChange={(e) => setLocForm({ ...locForm, kode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Pos:</label>
                <input
                  type="text"
                  placeholder="Contoh: Rumah Sakit Jiwa Kendari"
                  value={locForm.deskripsi}
                  onChange={(e) => setLocForm({ ...locForm, deskripsi: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat / Gedung:</label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Diponegoro No. 12"
                  value={locForm.alamat}
                  onChange={(e) => setLocForm({ ...locForm, alamat: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Warna Identitas Pos */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Warna Identitas Pos:</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setLocForm({ ...locForm, warna: c })}
                      className={`w-7 h-7 rounded-xl transition-all flex items-center justify-center ${
                        locForm.warna === c ? 'ring-2 ring-slate-800 scale-110 shadow-sm' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {locForm.warna === c && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                  <input
                    type="color"
                    value={locForm.warna}
                    onChange={(e) => setLocForm({ ...locForm, warna: e.target.value })}
                    className="w-8 h-8 rounded-xl border border-slate-300 cursor-pointer"
                    title="Pilih warna khusus"
                  />
                </div>
              </div>

              {/* Kuota Shift */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kuota Petugas per Shift:</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="block text-[10px] font-bold text-emerald-800">Pagi (P):</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={locForm.kuotaPagi}
                      onChange={(e) => setLocForm({ ...locForm, kuotaPagi: e.target.value })}
                      className="w-full mt-1 bg-white border border-emerald-300 rounded-lg px-2 py-1 text-center font-bold text-slate-900"
                    />
                  </div>
                  <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200">
                    <span className="block text-[10px] font-bold text-sky-800">Siang (S):</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={locForm.kuotaSiang}
                      onChange={(e) => setLocForm({ ...locForm, kuotaSiang: e.target.value })}
                      className="w-full mt-1 bg-white border border-sky-300 rounded-lg px-2 py-1 text-center font-bold text-slate-900"
                    />
                  </div>
                  <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200">
                    <span className="block text-[10px] font-bold text-indigo-800">Malam (M):</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={locForm.kuotaMalam}
                      onChange={(e) => setLocForm({ ...locForm, kuotaMalam: e.target.value })}
                      className="w-full mt-1 bg-white border border-indigo-300 rounded-lg px-2 py-1 text-center font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Pilih Petugas yang Ditugaskan */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-700">
                  Petugas Ditugaskan di Pos Ini ({locForm.assignedMemberIds.length} terpilih):
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                  {members.map(m => {
                    const isChecked = locForm.assignedMemberIds.includes(m.id);
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => handleToggleMemberInLocForm(m.id)}
                        className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isChecked
                            ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-950 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span>{m.avatar}</span>
                          <span className="truncate">{m.nama}</span>
                        </div>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md active:scale-95"
                >
                  {modalMode === 'create' ? 'Tambah Pos Lokasi' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PINDAH PENEMPATAN LOKASI (DENGAN PILIHAN RIWAYAT TETAP / RESET)  */}
      {/* ========================================================================= */}
      {reassignMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-blue-100 text-blue-700">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Ubah Penempatan Lokasi</h3>
                  <p className="text-xs text-slate-500">Mutasi pos dinas petugas piket</p>
                </div>
              </div>
              <button
                onClick={() => setReassignMember(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Info Petugas */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <span className="text-3xl">{reassignMember.avatar}</span>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{reassignMember.namaLengkap || reassignMember.nama}</h4>
                <p className="text-xs text-slate-500">{reassignMember.jabatan} • <span className="uppercase text-emerald-700 font-bold">{reassignMember.role}</span></p>
              </div>
            </div>

            {/* Pilihan Pos Lokasi Baru */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Pilih Pos Lokasi Penugasan (Bisa lebih dari 1):
              </label>

              <div className="space-y-2">
                {locations.map((loc) => {
                  const isChecked = selectedLocIds.includes(loc.id);
                  return (
                    <button
                      type="button"
                      key={loc.id}
                      onClick={() => handleToggleLocInReassign(loc.id)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-50/70 font-bold text-emerald-950 shadow-2xs ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: loc.warna || '#10b981' }}
                        />
                        <div>
                          <p className="text-xs font-bold">{loc.nama}</p>
                          <p className="text-[10px] text-slate-500">{loc.deskripsi || 'Pos Layanan'}</p>
                        </div>
                      </div>

                      {isChecked ? (
                        <span className="p-1 rounded-full bg-emerald-600 text-white shadow-2xs">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full border border-slate-300" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PILIHAN RIWAYAT PIKET: TETAP vs RESET (Sesuai Permintaan User) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <History className="w-4 h-4 text-emerald-600" />
                Perlakuan Riwayat Jadwal Piket Lama:
              </label>

              <div className="space-y-2 text-xs">
                {/* Opsi 1: Pertahankan Riwayat */}
                <div
                  onClick={() => setResetOption('keep')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    resetOption === 'keep'
                      ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <input
                      type="radio"
                      name="resetOption"
                      checked={resetOption === 'keep'}
                      onChange={() => setResetOption('keep')}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Pertahankan Riwayat Piket Lama</span>
                        <span className="px-1.5 py-0.2 bg-emerald-200 text-emerald-800 rounded-md text-[9px] font-black uppercase">
                          Disarankan
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Jadwal dan catatan kehadiran di pos lama tetap tersimpan sebagai arsip riwayat dinas. Jadwal di pos baru siap ditambahkan.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Opsi 2: Reset Jadwal */}
                <div
                  onClick={() => setResetOption('reset')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    resetOption === 'reset'
                      ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20 shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <input
                      type="radio"
                      name="resetOption"
                      checked={resetOption === 'reset'}
                      onChange={() => setResetOption('reset')}
                      className="mt-0.5 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                        <span>Reset & Bersihkan Jadwal Lama</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Jadwal dinas pada pos lama yang ditinggalkan akan di-reset / dibersihkan, dan lembar dinas dimulai baru pada pos yang dipilih.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReassignMember(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveReassign}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSaving ? (
                  <span>Menyimpan...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simpan Penempatan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL 3: SETUP / EDIT DATA NAMA STAF & ADMIN */}
      <MemberEditModal
        isOpen={Boolean(editingMember) || isCreatingMember}
        member={editingMember}
        mode={isCreatingMember ? 'create' : 'edit'}
        onClose={() => {
          setEditingMember(null);
          setIsCreatingMember(false);
        }}
      />
    </div>
  );
};
