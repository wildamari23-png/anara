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

  // Request browser notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

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

    if ('Notification' in window && Notification.permission === 'granted') {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(title, {
            body,
            icon: './icon-192.png',
            vibrate: [200, 100, 200],
            badge: './icon-192.png'
          });
        });
      } else {
        new Notification(title, {
          body,
          icon: './icon-192.png'
        });
      }
    }
  };

  // Schedule Modification
  const updateSchedule = (memberId, locationId, day, shiftCode) => {
    const key = `${memberId}_${locationId}`;
    setSchedules(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [day]: shiftCode
      }
    }));
  };

  // Auto-schedule generator
  const autoSchedule = (memberId, locationId, pattern = ['P', 'S', 'M', 'L', 'L']) => {
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

  // Check-In Attendance
  const checkIn = (locationId, shiftCode, note = '') => {
    if (!currentUser) return;
    const now = new Date();
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
  };

  // Locations management
  const addLocation = (loc) => {
    const newLoc = { ...loc, id: 'loc-' + Date.now(), isActive: true };
    setLocations(prev => [...prev, newLoc]);
    sendWebNotification('Lokasi Ditambahkan', `Lokasi "${newLoc.nama}" berhasil disimpan.`);
  };

  const updateLocation = (id, updated) => {
    setLocations(prev => prev.map(l => l.id === id ? { ...l, ...updated } : l));
  };

  const deleteLocation = (id) => {
    setLocations(prev => prev.filter(l => l.id !== id));
  };

  // Login & Logout (Sekali Login Tetap Login)
  const login = (member) => {
    setCurrentUser(member);
    localStorage.setItem('kp_current_user', JSON.stringify(member));
    sendWebNotification(`Halo, ${member.nama}! 👋`, `Sesi login Anda tersimpan permanen di HP ini.`);
  };

  const logout = () => {
    // We can clear or reset to default
    localStorage.removeItem('kp_current_user');
    setCurrentUser(null);
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
      members,
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
      syncSupabase,
      isSyncing,
      syncStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
