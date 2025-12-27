
import React from 'react';
import type { User } from '../types';
import { SparklesIcon } from './icons';

interface ProfileProps {
  user: User;
  onLogout: () => void;
  togglePremium: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout, togglePremium }) => {
  return (
    <div className="h-full bg-slate-50 p-6 md:p-8">
      <div className="flex flex-col items-center mb-10">
        <div className={`relative w-28 h-28 rounded-full p-1 border-4 ${user.isPremium ? 'border-amber-400 shadow-xl shadow-amber-100' : 'border-pink-200'}`}>
          <img 
            src={`https://picsum.photos/seed/${user.username}/128/128`}
            alt="User avatar"
            className="w-full h-full rounded-full object-cover"
          />
          {user.isPremium && (
            <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-2 rounded-full shadow-lg">
              <SparklesIcon className="w-5 h-5" />
            </div>
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mt-6">Welcome, {user.username}!</h2>
        <p className="text-gray-400 text-sm">Mother's Bloom Member</p>
      </div>

      <div className="space-y-4">
        <div className={`p-6 rounded-2xl shadow-sm border transition-all ${user.isPremium ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-bold ${user.isPremium ? 'text-amber-800' : 'text-gray-700'}`}>Bloom+ Subscription</h3>
            <button 
              onClick={togglePremium}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${user.isPremium ? 'bg-amber-500 text-white' : 'bg-pink-100 text-pink-600'}`}
            >
              {user.isPremium ? 'Manage' : 'Upgrade'}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            {user.isPremium 
              ? 'Your account is currently active with all premium features.' 
              : 'Unlock AI baby art, wellness plans, and meditations for $4.99.'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group cursor-pointer hover:border-pink-200 transition-all">
          <div>
            <h3 className="font-bold text-gray-700">Account Settings</h3>
            <p className="text-xs text-gray-400 mt-1">Notifications, Privacy, Security</p>
          </div>
          <div className="text-gray-300 group-hover:text-pink-400 transition-colors">→</div>
        </div>
      </div>

      <div className="mt-12">
        <button
          onClick={onLogout}
          className="w-full py-4 bg-white text-gray-400 font-bold rounded-2xl border border-gray-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
