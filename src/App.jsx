import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { MonitoringView } from './components/MonitoringView';
import { ScheduleView } from './components/ScheduleView';
import { LocationsView } from './components/LocationsView';
import { SummaryView } from './components/SummaryView';
import { SettingsView } from './components/SettingsView';
import { LoginModal } from './components/LoginModal';
import { NotificationModal } from './components/NotificationModal';
import { SwapShiftModal } from './components/SwapShiftModal';

const MainLayout = () => {
  const { activeTab, currentUser } = useApp();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Navigation Bar */}
      <Navbar
        onOpenNotif={() => setShowNotifModal(true)}
        onOpenLogin={() => setShowLoginModal(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4 sm:py-6">
        {activeTab === 'schedule' && <ScheduleView />}
        {activeTab === 'monitoring' && <MonitoringView onOpenSwap={() => setShowSwapModal(true)} />}
        {activeTab === 'locations' && <LocationsView />}
        {activeTab === 'summary' && <SummaryView />}
        {activeTab === 'settings' && <SettingsView onOpenLogin={() => setShowLoginModal(true)} />}
      </main>

      {/* Floating Bottom Navigation Bar (Mobile Android Dock) */}
      <BottomNav />

      {/* Login Modal / Screen (Jika belum login, wajib login dengan password) */}
      <LoginModal
        isOpen={!currentUser || showLoginModal}
        onClose={currentUser ? () => setShowLoginModal(false) : null}
      />

      <NotificationModal
        isOpen={showNotifModal}
        onClose={() => setShowNotifModal(false)}
      />

      <SwapShiftModal
        isOpen={showSwapModal}
        onClose={() => setShowSwapModal(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
