
import React, { useState, useEffect } from 'react';
import AIChat from './components/AIChat';
import Community from './components/Community';
import Tracker from './components/Tracker';
import Profile from './components/Profile';
import CareFinder from './components/CareFinder';
import WellnessHub from './components/WellnessHub';
import Auth from './components/Auth';
import BottomNav from './components/BottomNav';
import type { View, User } from './types';
import { BloomLogo } from './components/icons';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('chat');

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const location = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCurrentUser(prev => prev ? { ...prev, location } : null);
      });
    }
  }, []);

  const handleLogin = (user: User) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setCurrentView('chat');
  };

  const togglePremium = () => {
    if (!currentUser) return;
    const updated = { ...currentUser, isPremium: !currentUser.isPremium };
    setCurrentUser(updated);
    localStorage.setItem('currentUser', JSON.stringify(updated));
  };

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'chat': return <AIChat />;
      case 'community': return <Community user={currentUser} />;
      case 'tracker': return <Tracker user={currentUser} />;
      case 'wellness': return <WellnessHub user={currentUser} />;
      case 'care': return <CareFinder user={currentUser} />;
      case 'profile': return <Profile user={currentUser} onLogout={handleLogout} togglePremium={togglePremium} />;
      default: return <AIChat />;
    }
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-pink-50/50 max-w-2xl mx-auto shadow-2xl shadow-pink-200/50 overflow-hidden">
      <header className={`flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm z-10 transition-colors ${currentUser.isPremium ? 'border-amber-100' : 'border-pink-100'}`}>
        <div className="flex items-center">
          <BloomLogo className={`h-8 w-8 ${currentUser.isPremium ? 'text-amber-500' : 'text-pink-500'}`} />
          <h1 className="ml-3 text-xl font-bold text-gray-800 tracking-tight">
            Mother's <span className={currentUser.isPremium ? 'text-amber-500' : 'text-pink-500'}>Bloom{currentUser.isPremium && '+'}</span>
          </h1>
        </div>
        {currentUser.isPremium && (
          <div className="text-[10px] font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full border border-amber-200 uppercase tracking-tighter">
            Bloom+ Member
          </div>
        )}
      </header>
      <main className="flex-1 overflow-y-auto bg-white relative">
        {renderView()}
      </main>
      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
};

export default App;
