// Data awal pemetaan lokasi dan jadwal piket riil dari Google Sheet pengguna
// https://docs.google.com/spreadsheets/d/1SXyjPYWGVzyHks7AiXF0_8dozHdKDVosANI516ptqpg/edit?gid=1413221269

export const INITIAL_LOCATIONS = [
  {
    id: 'loc-1',
    nama: 'RSJ',
    kode: 'RSJ',
    deskripsi: 'Rumah Sakit Jiwa',
    alamat: 'Jl. Alianyang No. 1',
    warna: '#10b981', // Emerald
    kuotaPagi: 2,
    kuotaSiang: 2,
    kuotaMalam: 1,
    isActive: true
  },
  {
    id: 'loc-2',
    nama: 'RSUSI',
    kode: 'RSUSI',
    deskripsi: 'Rumah Sakit Umum Daerah',
    alamat: 'Jl. Ahmad Yani',
    warna: '#0284c7', // Sky Blue
    kuotaPagi: 2,
    kuotaSiang: 2,
    kuotaMalam: 2,
    isActive: true
  },
  {
    id: 'loc-3',
    nama: 'RS TK IV',
    kode: 'RS TK IV',
    deskripsi: 'Rumah Sakit Tingkat IV',
    alamat: 'Ksatrian',
    warna: '#8b5cf6', // Violet
    kuotaPagi: 2,
    kuotaSiang: 1,
    kuotaMalam: 1,
    isActive: true
  },
  {
    id: 'loc-4',
    nama: 'KEKE',
    kode: 'KEKE',
    deskripsi: 'Klinik & Pos Layanan Medis',
    alamat: 'Jl. Merdeka',
    warna: '#f59e0b', // Amber
    kuotaPagi: 1,
    kuotaSiang: 1,
    kuotaMalam: 0,
    isActive: true
  }
];

export const INITIAL_SHIFTS = [
  {
    kode: 'P',
    nama: 'Pagi',
    jamMulai: '07:00',
    jamSelesai: '14:00',
    warna: '#10b981',
    bgClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    badgeClass: 'bg-emerald-500 text-white',
    deskripsi: 'Dinas Pagi'
  },
  {
    kode: 'S',
    nama: 'Siang',
    jamMulai: '14:00',
    jamSelesai: '21:00',
    warna: '#0284c7',
    bgClass: 'bg-sky-100 text-sky-800 border-sky-300',
    badgeClass: 'bg-sky-500 text-white',
    deskripsi: 'Dinas Siang'
  },
  {
    kode: 'M',
    nama: 'Malam',
    jamMulai: '21:00',
    jamSelesai: '07:00',
    warna: '#6366f1',
    bgClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    badgeClass: 'bg-indigo-600 text-white',
    deskripsi: 'Dinas Malam'
  },
  {
    kode: 'L',
    nama: 'Libur',
    jamMulai: '00:00',
    jamSelesai: '00:00',
    warna: '#94a3b8',
    bgClass: 'bg-slate-100 text-slate-500 border-slate-200',
    badgeClass: 'bg-slate-400 text-white',
    deskripsi: 'Hari Lepas / Libur Piket'
  },
  {
    kode: 'P/S',
    nama: 'Pagi-Siang',
    jamMulai: '07:00',
    jamSelesai: '21:00',
    warna: '#f59e0b',
    bgClass: 'bg-amber-100 text-amber-800 border-amber-300',
    badgeClass: 'bg-amber-500 text-white',
    deskripsi: 'Double Shift Pagi & Siang'
  },
  {
    kode: 'S/M',
    nama: 'Siang-Malam',
    jamMulai: '14:00',
    jamSelesai: '07:00',
    warna: '#ec4899',
    bgClass: 'bg-pink-100 text-pink-800 border-pink-300',
    badgeClass: 'bg-pink-500 text-white',
    deskripsi: 'Double Shift Siang & Malam'
  },
  {
    kode: 'P/M',
    nama: 'Pagi-Malam',
    jamMulai: '07:00',
    jamSelesai: '07:00',
    warna: '#8b5cf6',
    bgClass: 'bg-purple-100 text-purple-800 border-purple-300',
    badgeClass: 'bg-purple-600 text-white',
    deskripsi: 'Double Shift Pagi & Malam'
  },
  {
    kode: 'PSM',
    nama: 'Pagi-Siang-Malam',
    jamMulai: '07:00',
    jamSelesai: '07:00',
    warna: '#ef4444',
    bgClass: 'bg-rose-100 text-rose-800 border-rose-300',
    badgeClass: 'bg-rose-500 text-white',
    deskripsi: 'Full 24 Jam'
  }
];

// Anggota dengan pemetaan LOKASI YANG SUDAH DITENTUKAN secara spesifik
export const INITIAL_MEMBERS = [
  {
    id: 'mem-1',
    nama: 'Fadil',
    namaLengkap: 'M. Fadilah A.',
    jabatan: 'Koordinator Piket',
    noHp: '081234567890',
    email: 'fadil@kitapiket.id',
    pin: '1234',
    password: 'admin123',
    role: 'admin',
    avatar: '👨‍⚕️',
    // Fadil HANYA di RSJ dan RS TK IV sesuai instruksi pengguna
    assignedLocations: ['loc-1', 'loc-3']
  },
  {
    id: 'mem-2',
    nama: 'Awa',
    namaLengkap: 'Awa Kusuma',
    jabatan: 'Petugas Piket',
    noHp: '081234567891',
    email: 'awa@kitapiket.id',
    pin: '1234',
    password: '123456',
    role: 'staf',
    avatar: '👩‍⚕️',
    // Awa di RS TK IV dan KEKE
    assignedLocations: ['loc-3', 'loc-4']
  },
  {
    id: 'mem-3',
    nama: 'Husniar A',
    namaLengkap: 'Husniar Anggraini',
    jabatan: 'Petugas Piket',
    noHp: '081234567892',
    email: 'husniar@kitapiket.id',
    pin: '1234',
    password: '123456',
    role: 'staf',
    avatar: '👩‍⚕️',
    // Husniar hanya di RSJ
    assignedLocations: ['loc-1']
  },
  {
    id: 'mem-4',
    nama: 'Delya Iid F.',
    namaLengkap: 'Delya Iid Fajarina',
    jabatan: 'Petugas Piket',
    noHp: '081234567893',
    email: 'delya@kitapiket.id',
    pin: '1234',
    password: '123456',
    role: 'staf',
    avatar: '👩‍⚕️',
    // Delya hanya di RSJ
    assignedLocations: ['loc-1']
  },
  {
    id: 'mem-5',
    nama: 'Nur Afifah O.',
    namaLengkap: 'Nur Afifah Oktaviani',
    jabatan: 'Petugas Piket',
    noHp: '081234567894',
    email: 'afifah@kitapiket.id',
    pin: '1234',
    password: '123456',
    role: 'staf',
    avatar: '👩‍⚕️',
    // Nur Afifah hanya di RSJ
    assignedLocations: ['loc-1']
  },
  {
    id: 'mem-6',
    nama: 'Agnes A',
    namaLengkap: 'Agnes Angelina',
    jabatan: 'Petugas Piket',
    noHp: '081234567895',
    email: 'agnes@kitapiket.id',
    pin: '1234',
    password: '123456',
    role: 'staf',
    avatar: '👩‍⚕️',
    // Agnes di RSJ dan RSUSI
    assignedLocations: ['loc-1', 'loc-2']
  },
  {
    id: 'mem-7',
    nama: 'Bagas',
    namaLengkap: 'Bagas Pratama',
    jabatan: 'Petugas Piket',
    noHp: '081234567896',
    email: 'bagas@kitapiket.id',
    pin: '1234',
    password: '123456',
    role: 'staf',
    avatar: '👨‍⚕️',
    // Bagas hanya di RSUSI
    assignedLocations: ['loc-2']
  },
  {
    id: 'mem-8',
    nama: 'Risna',
    namaLengkap: 'Risna Wati',
    jabatan: 'Petugas Piket',
    noHp: '081234567897',
    email: 'risna@kitapiket.id',
    pin: '1234',
    password: '123456',
    role: 'staf',
    avatar: '👩‍⚕️',
    // Risna hanya di RSUSI
    assignedLocations: ['loc-2']
  }
];

// Jadwal asli dari Google Sheet per pasangan [memberId_locationId]
export const INITIAL_SCHEDULES = {
  // Fadil - RSJ
  'mem-1_loc-1': {
    1: 'P', 2: 'M', 3: 'L', 4: 'L', 5: 'P', 6: 'M', 7: 'L', 8: 'S', 9: 'S', 10: 'M',
    11: 'L', 12: 'L', 13: 'P', 14: 'M', 15: 'L', 16: 'L', 17: 'S', 18: 'M', 19: 'L', 20: 'L',
    21: 'S', 22: 'M', 23: 'L', 24: 'L', 25: 'S', 26: 'P', 27: 'M', 28: 'L', 29: 'M', 30: 'L', 31: 'P'
  },
  // Fadil - RS TK IV (sesuai permintaan user: Fadil hanya RSJ dan RS TK IV)
  'mem-1_loc-3': {
    1: 'S', 2: 'S', 3: 'S', 4: 'M', 5: 'M', 6: 'M', 7: 'PSM', 8: 'P', 9: 'L', 10: 'S',
    11: 'L', 12: 'L', 13: 'S', 14: 'S', 15: 'P', 16: 'L', 17: 'P', 18: 'P', 19: 'L', 20: 'L',
    21: 'P', 22: 'S', 23: 'M', 24: 'P', 25: 'M', 26: 'S', 27: 'M', 28: 'L', 29: 'M', 30: 'S', 31: 'P'
  },
  // Awa - RS TK IV
  'mem-2_loc-3': {
    1: 'P', 2: 'L', 3: 'S/M', 4: 'M', 5: 'L', 6: 'L', 7: 'M', 8: 'L', 9: 'P', 10: 'P',
    11: 'S', 12: 'L', 13: 'S', 14: 'S', 15: 'M', 16: 'L', 17: 'P', 18: 'M', 19: 'L', 20: 'S',
    21: 'S', 22: 'P', 23: 'P', 24: 'L', 25: 'M', 26: 'M', 27: 'L', 28: 'L', 29: 'P', 30: 'S', 31: 'M'
  },
  // Awa - KEKE
  'mem-2_loc-4': {
    1: 'S', 2: 'P', 3: 'P', 4: 'S', 5: 'S', 6: 'P/S', 7: 'P', 8: 'P', 9: 'S', 10: 'S',
    11: 'P', 12: 'P/S', 13: 'P', 14: 'P', 15: 'S', 16: 'P', 17: 'S', 18: 'P', 19: 'P', 20: 'P/S',
    21: 'P', 22: 'S', 23: 'S', 24: 'P', 25: 'P', 26: 'P/S', 27: 'L', 28: 'L', 29: 'L', 30: 'L', 31: 'P'
  },
  // Husniar A - RSJ
  'mem-3_loc-1': {
    1: 'L', 2: 'P', 3: 'P', 4: 'P', 5: 'S', 6: 'S', 7: 'L', 8: 'L', 9: 'P', 10: 'P',
    11: 'P', 12: 'S', 13: 'S', 14: 'L', 15: 'L', 16: 'P', 17: 'P', 18: 'P', 19: 'S', 20: 'S',
    21: 'L', 22: 'L', 23: 'P', 24: 'P', 25: 'P', 26: 'S', 27: 'S', 28: 'L', 29: 'L', 30: 'P', 31: 'S'
  },
  // Delya Iid F. - RSJ
  'mem-4_loc-1': {
    1: 'L', 2: 'L', 3: 'M', 4: 'L', 5: 'L', 6: 'P', 7: 'S', 8: 'M', 9: 'L', 10: 'L',
    11: 'S', 12: 'M', 13: 'L', 14: 'S', 15: 'P', 16: 'M', 17: 'L', 18: 'L', 19: 'P', 20: 'M',
    21: 'L', 22: 'P', 23: 'S', 24: 'M', 25: 'L', 26: 'L', 27: 'P', 28: 'M', 29: 'L', 30: 'M', 31: 'L'
  },
  // Nur Afifah O. - RSJ
  'mem-5_loc-1': {
    1: 'M', 2: 'L', 3: 'L', 4: 'S', 5: 'M', 6: 'L', 7: 'P', 8: 'P', 9: 'M', 10: 'L',
    11: 'L', 12: 'P', 13: 'M', 14: 'L', 15: 'S', 16: 'S', 17: 'M', 18: 'L', 19: 'L', 20: 'P',
    21: 'M', 22: 'L', 23: 'L', 24: 'S', 25: 'M', 26: 'L', 27: 'L', 28: 'P', 29: 'S', 30: 'S', 31: 'M'
  },
  // Agnes A - RSJ
  'mem-6_loc-1': {
    1: 'S', 2: 'S', 3: 'S', 4: 'M', 5: 'L', 6: 'L', 7: 'M', 8: 'L', 9: 'L', 10: 'S',
    11: 'M', 12: 'L', 13: 'L', 14: 'P', 15: 'M', 16: 'L', 17: 'L', 18: 'S', 19: 'M', 20: 'L',
    21: 'P', 22: 'S', 23: 'M', 24: 'L', 25: 'L', 26: 'M', 27: 'L', 28: 'S', 29: 'P', 30: 'S', 31: 'P'
  },
  // Agnes A - RSUSI
  'mem-6_loc-2': {
    1: 'L', 2: 'M', 3: 'P', 4: 'S', 5: 'S', 6: 'L', 7: 'L', 8: 'L', 9: 'S', 10: 'M',
    11: 'P', 12: 'S', 13: 'M', 14: 'M', 15: 'S', 16: 'S', 17: 'L', 18: 'M', 19: 'P', 20: 'M',
    21: 'S', 22: 'M', 23: 'S', 24: 'L', 25: 'L', 26: 'P', 27: 'S', 28: 'P', 29: 'S', 30: 'P', 31: 'S'
  },
  // Bagas - RSUSI
  'mem-7_loc-2': {
    1: 'P', 2: 'L', 3: 'M', 4: 'P', 5: 'L', 6: 'P', 7: 'P', 8: 'M', 9: 'M', 10: 'P',
    11: 'M', 12: 'P', 13: 'L', 14: 'L', 15: 'M', 16: 'P', 17: 'M', 18: 'L', 19: 'S', 20: 'P',
    21: 'M', 22: 'P', 23: 'L', 24: 'M', 25: 'P', 26: 'L', 27: 'L', 28: 'M', 29: 'P', 30: 'M', 31: 'L'
  },
  // Risna - RSUSI
  'mem-8_loc-2': {
    1: 'M', 2: 'P', 3: 'L', 4: 'L', 5: 'P', 6: 'S', 7: 'S', 8: 'S', 9: 'P', 10: 'L',
    11: 'S', 12: 'M', 13: 'P', 14: 'P', 15: 'L', 16: 'M', 17: 'S', 18: 'S', 19: 'M', 20: 'S',
    21: 'L', 22: 'L', 23: 'P', 24: 'S', 25: 'S', 26: 'M', 27: 'P', 28: 'S', 29: 'L', 30: 'L', 31: 'M'
  }
};
