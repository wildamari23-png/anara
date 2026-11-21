-- =========================================================================
-- KITA PIKET - SUPABASE POSTGRESQL SCHEMA
-- Salin dan jalankan script ini di SQL Editor pada Supabase Dashboard Anda.
-- =========================================================================

-- 1. Tabel Pengaturan Lokasi Piket
CREATE TABLE IF NOT EXISTS lokasi_piket (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL UNIQUE,
    kode VARCHAR(20) NOT NULL,
    deskripsi TEXT,
    alamat TEXT,
    warna_hex VARCHAR(20) DEFAULT '#10b981',
    kuota_pagi INT DEFAULT 2,
    kuota_siang INT DEFAULT 2,
    kuota_malam INT DEFAULT 2,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabel Anggota / Staf Piket
CREATE TABLE IF NOT EXISTS anggota_piket (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL,
    nama_lengkap VARCHAR(150),
    jabatan VARCHAR(100) DEFAULT 'Petugas Piket',
    no_hp VARCHAR(30),
    email VARCHAR(100),
    pin VARCHAR(6) DEFAULT '1234',
    role VARCHAR(20) DEFAULT 'staf', -- 'admin' atau 'staf'
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tabel Master Shift
CREATE TABLE IF NOT EXISTS master_shift (
    kode VARCHAR(10) PRIMARY KEY,
    nama VARCHAR(50) NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    warna_badge VARCHAR(20) DEFAULT '#10b981',
    deskripsi VARCHAR(100)
);

INSERT INTO master_shift (kode, nama, jam_mulai, jam_selesai, warna_badge, deskripsi)
VALUES
    ('P', 'Pagi', '07:00:00', '14:00:00', '#10b981', 'Shift Dinas Pagi'),
    ('S', 'Siang', '14:00:00', '21:00:00', '#0284c7', 'Shift Dinas Siang'),
    ('M', 'Malam', '21:00:00', '07:00:00', '#6366f1', 'Shift Dinas Malam'),
    ('L', 'Libur', '00:00:00', '00:00:00', '#64748b', 'Hari Lepas / Libur Piket')
ON CONFLICT (kode) DO NOTHING;

-- 4. Tabel Jadwal Piket
CREATE TABLE IF NOT EXISTS jadwal_piket (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bulan INT NOT NULL, -- 1 s/d 12
    tahun INT NOT NULL,
    tanggal INT NOT NULL, -- 1 s/d 31
    tanggal_lengkap DATE NOT NULL,
    anggota_id UUID REFERENCES anggota_piket(id) ON DELETE CASCADE,
    lokasi_id UUID REFERENCES lokasi_piket(id) ON DELETE SET NULL,
    shift_kode VARCHAR(10) NOT NULL,
    catatan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(tahun, bulan, tanggal, anggota_id, lokasi_id)
);

-- 5. Tabel Monitoring & Kehadiran (Check-in)
CREATE TABLE IF NOT EXISTS monitoring_kehadiran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jadwal_id UUID REFERENCES jadwal_piket(id) ON DELETE CASCADE,
    anggota_id UUID REFERENCES anggota_piket(id) ON DELETE CASCADE,
    waktu_check_in TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    status VARCHAR(30) DEFAULT 'hadir', -- 'hadir', 'terlambat', 'izin', 'tukar'
    catatan TEXT,
    koordinat_lat DOUBLE PRECISION,
    koordinat_lng DOUBLE PRECISION,
    foto_bukti_url TEXT
);

-- 6. Tabel Permintaan Tukar Piket (Shift Swap)
CREATE TABLE IF NOT EXISTS tukar_piket (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pemohon_id UUID REFERENCES anggota_piket(id),
    pengganti_id UUID REFERENCES anggota_piket(id),
    jadwal_pemohon_id UUID REFERENCES jadwal_piket(id),
    jadwal_pengganti_id UUID REFERENCES jadwal_piket(id),
    alasan TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'disetujui', 'ditolak'
    disetujui_oleh UUID REFERENCES anggota_piket(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Aktifkan Realtime Replication untuk monitoring instan
ALTER PUBLICATION supabase_realtime ADD TABLE jadwal_piket;
ALTER PUBLICATION supabase_realtime ADD TABLE monitoring_kehadiran;
ALTER PUBLICATION supabase_realtime ADD TABLE tukar_piket;
