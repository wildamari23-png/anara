# 🏥 Kita Piket — Aplikasi Jadwal Dinas & Monitoring PWA

Aplikasi cerdas, modern, dan interaktif untuk penyusunan jadwal dinas/piket nakes & staf (seperti di Google Sheet), monitoring kehadiran real-time, pengaturan lokasi, dan pengingat shift di HP Android (Progressive Web App).

---

## 🌟 Fitur Utama

1. **Jadwal Matriks Interaktif (Seperti Google Sheets)**
   - Tampilan kalender & tabel matriks bulanan (tanggal 1 s/d 31) yang ramah layar sentuh HP (horizontal scroll lancar).
   - Filter instan berdasarkan **Lokasi Piket** (`RSJ`, `RSUSI`, `RS TK IV`, `KEKE`) dan **Nama Petugas**.
   - **Quick Edit Shift**: Cukup ketuk kotak tanggal untuk mengubah shift (*Pagi [P]*, *Siang [S]*, *Malam [M]*, *Libur [L]*, atau *Kombinasi*).
   - **Generator Rotasi Otomatis (Auto-Schedule)**: Isi jadwal satu bulan penuh dalam 1 detik dengan pola rotasi (misal: P ➔ S ➔ M ➔ L ➔ L).
   - **Export & Share**: Cetak atau unduh ke format CSV (Excel) dan bagikan jadwal dinas harian langsung ke WhatsApp.

2. **Monitoring Real-Time & Check-In Mandiri**
   - Mendeteksi shift yang sedang aktif saat ini secara otomatis berdasarkan jam real-time.
   - Kartu *Jadwal Saya*: Petugas dapat langsung melakukan **Konfirmasi Kehadiran / Check-In Piket** dengan satu ketukan (lengkap dengan animasi confetti dan jam check-in).
   - Monitoring daftar petugas yang sedang bertugas di setiap lokasi hari ini.
   - Permintaan **Tukar Piket (Swap Shift)** antar petugas dinas.

3. **Pengaturan Lokasi Piket Dinamis**
   - Tambah, ubah, atau hapus lokasi piket kapan saja.
   - Kustomisasi nama lokasi, deskripsi, alamat, warna tag/badge identitas, dan kuota petugas per shift (Pagi, Siang, Malam).

4. **Sistem Sekali Login (Persistent Remember Me)**
   - Petugas/Koordinator cukup login sekali, sesi langsung tersimpan terus di HP secara permanen.
   - Mode Akun: **Koordinator / Admin** (akses penuh) & **Staf Petugas**.
   - Beralih akun dengan cepat melalui menu profil.

5. **Notifikasi Pengingat di HP (Web Push & Local Reminder)**
   - Mendukung browser Web Notification API & Service Worker di Android.
   - Pengingat otomatis sebelum jam dinas dimulai.
   - Pusat notifikasi di dalam aplikasi (*in-app notification center*).

6. **Desain Cerah & Kekinian (Mobile-First Android PWA)**
   - Tampilan bersih, kontras cerah (*vibrant pastel & dark mode*), kartu *glassmorphism*, dan animasi halus.
   - Floating Bottom Dock ala Android/iOS modern.
   - Bisa dipasang di layar utama HP (*Add to Home Screen*) tanpa perlu download dari Google Play Store.

7. **Database Supabase Cloud Terintegrasi**
   - Skrip schema SQL siap pakai (`supabase_schema.sql`).
   - Fitur upload & sinkronisasi data 1-klik ke Supabase.
   - Mendukung operasi offline secara penuh jika koneksi internet terputus.

---

## 🚀 Cara Menjalankan di Komputer / Laptop

```bash
# 1. Masuk ke folder proyek
cd kita-piket

# 2. Jalankan server pengembangan
npm run dev
```

Buka browser Anda di `http://localhost:3000`.

---

## 📲 Cara Pasang di HP Android (PWA)

1. Buka tautan aplikasi di **Google Chrome** pada HP Android Anda.
2. Ketuk ikon **titik tiga (⋮)** di pojok kanan atas Chrome.
3. Pilih **"Tambahkan ke Layar Utama"** (atau *"Install App"*).
4. Aplikasi **Kita Piket** akan langsung terpasang di HP Anda dan bisa dibuka secara mandiri seperti aplikasi Android native!

---

## ☁️ Menghubungkan ke Supabase (Database Cloud)

1. Buat proyek baru di [supabase.com](https://supabase.com).
2. Buka menu **SQL Editor** di Supabase Dashboard, lalu salin dan jalankan seluruh isi file `supabase_schema.sql`.
3. Buka menu **Project Settings ➔ API**, salin `Project URL` dan `anon public key`.
4. Di aplikasi Kita Piket, buka tab **Pengaturan ➔ Integrasi Cloud Supabase**, masukkan URL dan Key tersebut, lalu ketuk **Simpan** dan **Upload / Sinkronkan Data**.

---

## 📦 Deploy ke GitHub & Hosting Gratis

### Cara Push ke GitHub:
```bash
git init
git add .
git commit -m "Inisialisasi aplikasi Kita Piket PWA"
git branch -M main
git remote add origin https://github.com/USERNAME/kita-piket.git
git push -u origin main
```

Aplikasi ini dapat langsung dideploy ke **Vercel**, **Netlify**, atau **GitHub Pages** dengan perintah build:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
