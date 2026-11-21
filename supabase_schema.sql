-- =========================================================================
-- KITA PIKET - SUPABASE POSTGRESQL SCHEMA (Lengkap & Siap Pakai)
-- Jalankan script ini di SQL Editor pada Supabase Dashboard Anda:
-- https://supabase.com/dashboard/project/genmorzzqjnhcbssltuo/sql/new
-- =========================================================================

-- 1. Tabel Pengaturan Lokasi Piket
CREATE TABLE IF NOT EXISTS public.lokasi_piket (
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
CREATE TABLE IF NOT EXISTS public.anggota_piket (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL UNIQUE,
    nama_lengkap VARCHAR(150),
    jabatan VARCHAR(100) DEFAULT 'Petugas Piket',
    no_hp VARCHAR(30),
    email VARCHAR(100) UNIQUE,
    pin VARCHAR(6) DEFAULT '1234',
    role VARCHAR(20) DEFAULT 'staf', -- 'admin' atau 'staf'
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tabel Master Shift
CREATE TABLE IF NOT EXISTS public.master_shift (
    kode VARCHAR(10) PRIMARY KEY,
    nama VARCHAR(50) NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    warna_badge VARCHAR(20) DEFAULT '#10b981',
    deskripsi VARCHAR(100)
);

INSERT INTO public.master_shift (kode, nama, jam_mulai, jam_selesai, warna_badge, deskripsi)
VALUES
    ('P', 'Pagi', '07:00:00', '14:00:00', '#10b981', 'Shift Dinas Pagi'),
    ('S', 'Siang', '14:00:00', '21:00:00', '#0284c7', 'Shift Dinas Siang'),
    ('M', 'Malam', '21:00:00', '07:00:00', '#6366f1', 'Shift Dinas Malam'),
    ('L', 'Libur', '00:00:00', '00:00:00', '#64748b', 'Hari Lepas / Libur Piket')
ON CONFLICT (kode) DO NOTHING;

-- 4. Tabel Jadwal Piket
CREATE TABLE IF NOT EXISTS public.jadwal_piket (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bulan INT NOT NULL, -- 1 s/d 12
    tahun INT NOT NULL,
    tanggal INT NOT NULL, -- 1 s/d 31
    tanggal_lengkap DATE,
    anggota_id UUID REFERENCES public.anggota_piket(id) ON DELETE CASCADE,
    lokasi_id UUID REFERENCES public.lokasi_piket(id) ON DELETE SET NULL,
    shift_kode VARCHAR(10) NOT NULL,
    catatan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Tabel Monitoring & Kehadiran (Check-in)
CREATE TABLE IF NOT EXISTS public.monitoring_kehadiran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jadwal_id UUID REFERENCES public.jadwal_piket(id) ON DELETE CASCADE,
    anggota_id UUID REFERENCES public.anggota_piket(id) ON DELETE CASCADE,
    waktu_check_in TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    status VARCHAR(30) DEFAULT 'hadir', -- 'hadir', 'terlambat', 'izin', 'tukar'
    catatan TEXT,
    koordinat_lat DOUBLE PRECISION,
    koordinat_lng DOUBLE PRECISION,
    foto_bukti_url TEXT
);

-- 6. Tabel Permintaan Tukar Piket (Shift Swap)
CREATE TABLE IF NOT EXISTS public.tukar_piket (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pemohon_id UUID REFERENCES public.anggota_piket(id),
    pengganti_id UUID REFERENCES public.anggota_piket(id),
    jadwal_pemohon_id UUID REFERENCES public.jadwal_piket(id),
    jadwal_pengganti_id UUID REFERENCES public.jadwal_piket(id),
    alasan TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'disetujui', 'ditolak'
    disetujui_oleh UUID REFERENCES public.anggota_piket(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Izin Akses Publik (RLS Open untuk PWA Client)
ALTER TABLE public.lokasi_piket ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access lokasi_piket" ON public.lokasi_piket;
CREATE POLICY "Public access lokasi_piket" ON public.lokasi_piket FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.anggota_piket ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access anggota_piket" ON public.anggota_piket;
CREATE POLICY "Public access anggota_piket" ON public.anggota_piket FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.master_shift ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access master_shift" ON public.master_shift;
CREATE POLICY "Public access master_shift" ON public.master_shift FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.jadwal_piket ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access jadwal_piket" ON public.jadwal_piket;
CREATE POLICY "Public access jadwal_piket" ON public.jadwal_piket FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.monitoring_kehadiran ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access monitoring_kehadiran" ON public.monitoring_kehadiran;
CREATE POLICY "Public access monitoring_kehadiran" ON public.monitoring_kehadiran FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.tukar_piket ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access tukar_piket" ON public.tukar_piket;
CREATE POLICY "Public access tukar_piket" ON public.tukar_piket FOR ALL USING (true) WITH CHECK (true);

-- 8. Realtime Replication
ALTER PUBLICATION supabase_realtime ADD TABLE public.jadwal_piket;
ALTER PUBLICATION supabase_realtime ADD TABLE public.monitoring_kehadiran;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tukar_piket;
