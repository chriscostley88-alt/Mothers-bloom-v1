
import React from 'react';
import type { View } from '../types';
import { ChatIcon, CommunityIcon, TrackerIcon, ProfileIcon, HospitalIcon, SparklesIcon } from './icons';

interface BottomNavProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  isPremium?: boolean;
}> = ({ label, icon, isActive, onClick, isPremium }) => {
  const activeClasses = isPremium ? 'text-amber-600 scale-110' : 'text-pink-500 scale-110';
  const inactiveClasses = 'text-gray-400 hover:text-pink-300';

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full transition-all duration-200 ${isActive ? activeClasses : inactiveClasses}`}
    >
      <div className={`${isActive ? (isPremium ? 'bg-amber-50' : 'bg-pink-50') + ' p-1.5 rounded-xl' : ''}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold mt-1 transition-opacity ${isActive ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
    </button>
  );
};


const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView }) => {
  return (
    <nav className="flex items-center justify-around bg-white h-20 border-t border-pink-50 shadow-[0_-4px_20px_-5px_rgba(236,72,153,0.1)] px-2">
      <NavItem
        label="Chat"
        icon={<ChatIcon className="w-5 h-5" />}
        isActive={currentView === 'chat'}
        onClick={() => setCurrentView('chat')}
      />
       <NavItem
        label="Tracker"
        icon={<TrackerIcon className="w-5 h-5" />}
        isActive={currentView === 'tracker'}
        onClick={() => setCurrentView('tracker')}
      />
      <NavItem
        label="Bloom+"
        icon={<SparklesIcon className="w-5 h-5" />}
        isActive={currentView === 'wellness'}
        onClick={() => setCurrentView('wellness')}
        isPremium
      />
      <NavItem
        label="Care"
        icon={<HospitalIcon className="w-5 h-5" />}
        isActive={currentView === 'care'}
        onClick={() => setCurrentView('care')}
      />
      <NavItem
        label="Profile"
        icon={<ProfileIcon className="w-5 h-5" />}
        isActive={currentView === 'profile'}
        onClick={() => setCurrentView('profile')}
      />
    </nav>
  );
};

export default BottomNav;
