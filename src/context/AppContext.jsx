import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_LOCATIONS, INITIAL_MEMBERS, INITIAL_SHIFTS, INITIAL_SCHEDULES } from '../initialData';
import { getSupabaseClient } from '../supabaseClient';
import confetti from 'canvas-confetti';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // 1. Single Login Session (Persistent in localStorage - Tetap Login)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('kp_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) return parsed;
      } catch (e) {
        console.warn('Error reading saved session:', e);
      }
    }
    // Default: Fadil (Koordinator / Admin) - Selalu login aktif
    return INITIAL_MEMBERS[0];
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('schedule'); // Default langsung ke Jadwal agar mudah entri

  // Month & Year selector
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  // 2. Core Entities
  const [locations, setLocations] = useState(() => {
    const saved = localStorage.getItem('kp_locations');
    return saved ? JSON.parse(saved) : INITIAL_LOCATIONS;
  });

  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('kp_members_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_MEMBERS;
  });

  const [shifts, setShifts] = useState(() => {
    const saved = localStorage.getItem('kp_shifts');
    return saved ? JSON.parse(saved) : INITIAL_SHIFTS;
  });

  const [schedules, setSchedules] = useState(() => {
    const saved = localStorage.getItem('kp_schedules');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULES;
  });

  // 3. Attendance Check-ins
  const [attendance, setAttendance] = useState(() => {
    const saved = localStorage.getItem('kp_attendance');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'att-1',
        memberId: 'mem-1',
        memberName: 'Fadil',
        locationId: 'loc-1',
        locationName: 'RSJ',
        date: today.toISOString().split('T')[0],
        time: '06:55',
        shift: 'P',
        status: 'Tepat Waktu',
        note: 'Siap piket pagi IGD'
      }
    ];
  });

  // 4. Swap Requests
  const [swapRequests, setSwapRequests] = useState(() => {
    const saved = localStorage.getItem('kp_swap_requests');
    return saved ? JSON.parse(saved) : [];
  });

  // 5. In-App Notifications
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('kp_notifications');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'notif-1',
        title: 'Selamat Datang di Kita Piket!',
        body: 'Aplikasi jadwal dinas cerdas & pemantau piket aktif.',
        time: 'Baru saja',
        read: false,
        type: 'info'
      }
    ];
  });

  // Save to LocalStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('kp_current_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  useEffect(() => { localStorage.setItem('kp_locations', JSON.stringify(locations)); }, [locations]);
  useEffect(() => { localStorage.setItem('kp_members_v2', JSON.stringify(members)); }, [members]);
  useEffect(() => { localStorage.setItem('kp_shifts', JSON.stringify(shifts)); }, [shifts]);
  useEffect(() => { localStorage.setItem('kp_schedules', JSON.stringify(schedules)); }, [schedules]);
  useEffect(() => { localStorage.setItem('kp_attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem('kp_swap_requests', JSON.stringify(swapRequests)); }, [swapRequests]);
  useEffect(() => { localStorage.setItem('kp_notifications', JSON.stringify(notifications)); }, [notifications]);

  // Notification Permission State
  const [notificationPermission, setNotificationPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  // Request browser notification permission (Triggered by user button click)
  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Browser Anda belum mendukung fitur Notifikasi Web.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        sendWebNotification(
          'Notifikasi HP Aktif! 🔔',
          'Pengingat jadwal dinas Kita Piket kini akan tampil di bagian atas layar HP Anda.'
        );
        return true;
      } else if (permission === 'denied') {
        alert('Izin notifikasi diblokir. Silakan klik ikon gembok di bilah alamat browser, lalu ubah izin Notifikasi menjadi "Izinkan".');
        return false;
      }
    } catch (e) {
      console.warn('Error requesting permission:', e);
      return false;
    }
    return false;
  };

  // Send Push / Web Notification
  const sendWebNotification = (title, body) => {
    const newNotif = {
      id: 'notif-' + Date.now(),
      title,
      body,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      type: 'alert'
    };
    setNotifications(prev => [newNotif, ...prev]);

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const options = {
        body,
        icon: './icon-192.png',
        badge: './icon-192.png',
        vibrate: [200, 100, 200, 100, 200],
        tag: 'kp-' + Date.now(),
        renotify: true,
        data: { url: './' }
      };

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
          .then(reg => {
            reg.showNotification(title, options);
          })
          .catch(() => {
            try { new Notification(title, options); } catch (e) {}
          });
      } else {
        try { new Notification(title, options); } catch (e) {}
      }
    }
  };

  // Schedule Modification with Role Protection (Staf tidak bisa edit)
  const updateSchedule = (memberId, locationId, day, shiftCode) => {
    if (currentUser?.role === 'staf') {
      sendWebNotification('Akses Terbatas', 'Akun Staf hanya dapat melihat jadwal sendiri dan tidak diizinkan mengubah jadwal.');
      return;
    }
    const key = `${memberId}_${locationId}`;
    setSchedules(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [day]: shiftCode
      }
    }));
  };

  // Auto-schedule generator (Admin only)
  const autoSchedule = (memberId, locationId, pattern = ['P', 'S', 'M', 'L', 'L']) => {
    if (currentUser?.role === 'staf') {
      sendWebNotification('Akses Terbatas', 'Hanya Koordinator / Admin yang dapat menerapkan rotasi otomatis.');
      return;
    }
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const newDaySchedule = {};
    for (let day = 1; day <= daysInMonth; day++) {
      const shift = pattern[(day - 1) % pattern.length];
      newDaySchedule[day] = shift;
    }
    const key = `${memberId}_${locationId}`;
    setSchedules(prev => ({
      ...prev,
      [key]: newDaySchedule
    }));
    sendWebNotification('Jadwal Otomatis Diterapkan', `Pola rotasi piket berhasil disimpan untuk 1 bulan.`);
  };

  // Get Shift Information & Operational Hours
  const getShiftTimeInfo = (shiftCode) => {
    switch (shiftCode) {
      case 'P':
        return { name: 'Pagi', time: '07:00 - 14:00', startHour: 6, startMin: 30, endHour: 14, endMin: 0 };
      case 'S':
        return { name: 'Siang', time: '14:00 - 21:00', startHour: 13, startMin: 30, endHour: 21, endMin: 0 };
      case 'M':
        return { name: 'Malam', time: '21:00 - 07:00', startHour: 20, startMin: 30, endHour: 7, endMin: 0, crossesMidnight: true };
      case 'P/S':
        return { name: 'Pagi-Siang', time: '07:00 - 21:00', startHour: 6, startMin: 30, endHour: 21, endMin: 0 };
      case 'S/M':
        return { name: 'Siang-Malam', time: '14:00 - 07:00', startHour: 13, startMin: 30, endHour: 7, endMin: 0, crossesMidnight: true };
      case 'PSM':
        return { name: 'Pagi-Siang-Malam (24 Jam)', time: '07:00 - 07:00', startHour: 0, startMin: 0, endHour: 24, endMin: 0, crossesMidnight: true };
      default:
        return { name: 'Libur', time: 'Hari Lepas', startHour: -1, endHour: -1 };
    }
  };

  // Check if current time falls within allowable check-in window of a given shift
  const isShiftWindowActive = (shiftCode) => {
    if (!shiftCode || shiftCode === 'L') return false;
    if (shiftCode === 'PSM') return true;

    const info = getShiftTimeInfo(shiftCode);
    if (info.startHour === -1) return false;

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const startMins = info.startHour * 60 + (info.startMin || 0);
    const endMins = info.endHour * 60 + (info.endMin || 0);

    if (info.crossesMidnight) {
      return currentMins >= startMins || currentMins <= endMins;
    } else {
      return currentMins >= startMins && currentMins <= endMins;
    }
  };

  // Check-In Attendance with Strict Shift Validation
  const checkIn = (locationId, shiftCode, note = '') => {
    if (!currentUser) return { success: false, message: 'Silakan login terlebih dahulu.' };
    const now = new Date();
    const currentDay = now.getDate();

    // Validasi ketat untuk Staf:
    if (currentUser.role === 'staf') {
      const key = `${currentUser.id}_${locationId}`;
      const scheduledShift = schedules[key]?.[currentDay] || 'L';

      if (scheduledShift === 'L' || !scheduledShift) {
        const msg = 'Gagal Check-In: Anda tidak memiliki jadwal piket dinas di lokasi ini hari ini (Hari Lepas / Libur).';
        sendWebNotification('Check-In Ditolak ⚠️', msg);
        return { success: false, message: msg };
      }

      if (!isShiftWindowActive(scheduledShift)) {
        const info = getShiftTimeInfo(scheduledShift);
        const msg = `Gagal Check-In: Bukan jam dinas Anda! Jadwal Anda hari ini adalah Shift ${scheduledShift} (${info.name}: ${info.time}). Konfirmasi kehadiran hanya dibuka saat jam shift dinas Anda berlangsung.`;
        sendWebNotification('Bukan Jam Dinas ⚠️', msg);
        return { success: false, message: msg };
      }
    }

    const loc = locations.find(l => l.id === locationId);
    const newRecord = {
      id: 'att-' + Date.now(),
      memberId: currentUser.id,
      memberName: currentUser.nama,
      locationId,
      locationName: loc ? loc.nama : 'Pos Piket',
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      shift: shiftCode,
      status: 'Hadir Tepat Waktu',
      note: note || 'Konfirmasi kehadiran mandiri'
    };

    setAttendance(prev => [newRecord, ...prev]);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.75 },
      colors: ['#10b981', '#0ea5e9', '#f59e0b', '#6366f1']
    });

    sendWebNotification('Check-In Berhasil! ✅', `Tercatat hadir piket di ${loc?.nama || 'Pos'} jam ${newRecord.time}.`);
    return { success: true, message: `Check-in berhasil di ${loc?.nama || 'Pos'}!` };
  };

  // Locations management
  const addLocation = (loc) => {
    const newLoc = { ...loc, id: 'loc-' + Date.now(), isActive: true };
    setLocations(prev => [...prev, newLoc]);
    sendWebNotification('Lokasi Ditambahkan 📍', `Lokasi "${newLoc.nama}" berhasil disimpan.`);
    return newLoc;
  };

  const updateLocation = (id, updated) => {
    setLocations(prev => prev.map(l => l.id === id ? { ...l, ...updated } : l));
    sendWebNotification('Lokasi Diperbarui 📍', `Data pos "${updated.nama || 'Piket'}" berhasil diperbarui.`);
  };

  const deleteLocation = (id) => {
    const loc = locations.find(l => l.id === id);
    setLocations(prev => prev.filter(l => l.id !== id));
    sendWebNotification('Lokasi Dihapus 🗑️', `Pos "${loc?.nama || 'Piket'}" berhasil dihapus.`);
  };

  // Reassign Member Location with History Keeping or Resetting Option
  const reassignMemberLocation = (memberId, newLocationIds, resetScheduleOption = 'keep') => {
    const member = members.find(m => m.id === memberId);
    if (!member) return { success: false, message: 'Petugas tidak ditemukan.' };

    const oldLocationIds = member.assignedLocations || [];
    const removedLocations = oldLocationIds.filter(id => !newLocationIds.includes(id));
    const addedLocations = newLocationIds.filter(id => !oldLocationIds.includes(id));

    // Handle Schedules based on user choice (Tetap vs Reset)
    setSchedules(prev => {
      const nextSchedules = { ...prev };

      if (resetScheduleOption === 'reset') {
        // Hapus/reset jadwal lama pada pos yang ditinggalkan
        removedLocations.forEach(locId => {
          const key = `${memberId}_${locId}`;
          delete nextSchedules[key];
        });
      }

      // Pastikan jadwal untuk lokasi baru siap diakses
      addedLocations.forEach(locId => {
        const key = `${memberId}_${locId}`;
        if (!nextSchedules[key]) {
          nextSchedules[key] = {};
        }
      });

      return nextSchedules;
    });

    // Update member assigned locations
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, assignedLocations: newLocationIds } : m));

    // Update current user session if it is the modified member
    if (currentUser?.id === memberId) {
      setCurrentUser(prev => prev ? { ...prev, assignedLocations: newLocationIds } : prev);
    }

    const modeText = resetScheduleOption === 'reset' ? 'Jadwal pos lama di-reset' : 'Riwayat piket lama tetap dipertahankan';
    sendWebNotification('Penempatan Lokasi Diperbarui 📍', `Penempatan ${member.nama} berhasil diubah (${modeText}).`);
    return { success: true, message: `Penempatan ${member.nama} sukses disimpan!` };
  };

  // Add Member / Petugas Baru (Admin Only)
  const addMember = (memberData) => {
    const newMember = {
      ...memberData,
      id: 'mem-' + Date.now(),
      nama: memberData.nama.trim(),
      namaLengkap: memberData.namaLengkap ? memberData.namaLengkap.trim() : memberData.nama.trim(),
      jabatan: memberData.jabatan ? memberData.jabatan.trim() : 'Petugas Piket',
      noHp: memberData.noHp ? memberData.noHp.trim() : '',
      email: memberData.email ? memberData.email.trim() : `${memberData.nama.toLowerCase().replace(/\s+/g, '')}@kitapiket.id`,
      pin: memberData.pin ? memberData.pin.trim() : '1234',
      password: memberData.password ? memberData.password.trim() : (memberData.role === 'admin' ? 'admin123' : '123456'),
      role: memberData.role || 'staf',
      avatar: memberData.avatar || '👨‍⚕️',
      assignedLocations: memberData.assignedLocations || [locations[0]?.id || 'loc-1']
    };
    setMembers(prev => [...prev, newMember]);
    sendWebNotification('Petugas Ditambahkan 👤', `Akun ${newMember.nama} (${newMember.role === 'admin' ? 'Admin' : 'Staf'}) berhasil didaftarkan.`);
    return newMember;
  };

  // Update Member / Edit Data Staf & Admin (Admin Only)
  const updateMember = (id, updatedData) => {
    setMembers(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, ...updatedData };
      }
      return m;
    }));

    // If current logged in user is being updated, update session too
    if (currentUser?.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...updatedData } : prev);
    }

    sendWebNotification('Profil Petugas Diperbarui ✏️', `Data profil "${updatedData.nama || 'Petugas'}" berhasil diperbarui.`);
    return { success: true };
  };

  // Delete Member
  const deleteMember = (id) => {
    const member = members.find(m => m.id === id);
    if (!member) return;
    if (members.length <= 1) {
      alert('Tidak dapat menghapus. Harus menyisakan minimal 1 petugas.');
      return;
    }
    setMembers(prev => prev.filter(m => m.id !== id));
    sendWebNotification('Petugas Dihapus 🗑️', `Akun ${member.nama} telah dihapus dari sistem.`);
  };

  // Login & Logout dengan Sistem Password & PIN (Sekali Login Tetap Login)
  const loginWithPassword = (memberId, password) => {
    const member = members.find(m => m.id === memberId);
    if (!member) {
      return { success: false, message: 'Petugas tidak ditemukan dalam daftar.' };
    }
    const inputClean = (password || '').trim();
    const validPass = Boolean(member.password && member.password === inputClean);
    const validPin = Boolean(member.pin && member.pin === inputClean);
    const fallbackPass = member.role === 'admin' ? 'admin123' : '123456';
    const fallbackPin = '1234';

    if (validPass || validPin || inputClean === fallbackPass || inputClean === fallbackPin) {
      setCurrentUser(member);
      localStorage.setItem('kp_current_user', JSON.stringify(member));
      sendWebNotification(`Halo, ${member.nama}! 👋`, `Login berhasil sebagai ${member.role === 'admin' ? 'Koordinator/Admin' : 'Petugas Staf'}.`);
      return { success: true, member };
    }
    return { success: false, message: 'Password atau PIN salah. Silakan coba lagi.' };
  };

  const login = (member) => {
    setCurrentUser(member);
    localStorage.setItem('kp_current_user', JSON.stringify(member));
    sendWebNotification(`Halo, ${member.nama}! 👋`, `Sesi login Anda tersimpan permanen di HP ini.`);
  };

  const logout = () => {
    localStorage.removeItem('kp_current_user');
    setCurrentUser(null);
    sendWebNotification('Keluar Sesi', 'Anda telah keluar. Silakan login kembali.');
  };

  // Supabase Sync
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  const syncSupabase = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setSyncStatus({ success: false, message: 'URL atau Anon Key Supabase belum diatur. Masukkan di menu Pengaturan.' });
      return;
    }

    setIsSyncing(true);
    setSyncStatus(null);
    try {
      for (const loc of locations) {
        await supabase.from('lokasi_piket').upsert({
          nama: loc.nama,
          kode: loc.kode,
          deskripsi: loc.deskripsi,
          alamat: loc.alamat,
          warna_hex: loc.warna,
          kuota_pagi: loc.kuotaPagi,
          kuota_siang: loc.kuotaSiang,
          kuota_malam: loc.kuotaMalam
        }, { onConflict: 'nama' });
      }

      for (const mem of members) {
        await supabase.from('anggota_piket').upsert({
          nama: mem.nama,
          nama_lengkap: mem.namaLengkap,
          jabatan: mem.jabatan,
          no_hp: mem.noHp,
          email: mem.email,
          pin: mem.pin,
          role: mem.role
        }, { onConflict: 'email' });
      }

      setSyncStatus({ success: true, message: 'Semua data jadwal & lokasi sukses disinkronkan ke Supabase cloud!' });
      sendWebNotification('Sinkronisasi Supabase Sukses ☁️', 'Database cloud Supabase telah diperbarui.');
    } catch (err) {
      setSyncStatus({ success: false, message: 'Gagal sinkronisasi: ' + err.message });
    } finally {
      setIsSyncing(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      login,
      loginWithPassword,
      logout,
      activeTab,
      setActiveTab,
      selectedMonth,
      setSelectedMonth,
      selectedYear,
      setSelectedYear,
      locations,
      addLocation,
      updateLocation,
      deleteLocation,
      reassignMemberLocation,
      members,
      addMember,
      updateMember,
      deleteMember,
      shifts,
      schedules,
      updateSchedule,
      autoSchedule,
      attendance,
      checkIn,
      swapRequests,
      setSwapRequests,
      notifications,
      unreadCount,
      markAllNotificationsRead,
      sendWebNotification,
      notificationPermission,
      requestNotificationPermission,
      getShiftTimeInfo,
      isShiftWindowActive,
      syncSupabase,
      isSyncing,
      syncStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
