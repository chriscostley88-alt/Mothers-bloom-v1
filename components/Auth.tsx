import React, { useState } from 'react';
import type { User } from '../types';
import { BloomLogo, GoogleIcon, FacebookIcon } from './icons';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin({ username });
    }
  };

  const handleSocialLogin = (provider: string) => {
    onLogin({ username: `${provider}User` });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen font-sans bg-pink-50/50 p-4">
      <div className="w-full max-w-sm mx-auto bg-white p-8 rounded-2xl shadow-2xl shadow-pink-200/50">
        <div className="flex flex-col items-center mb-6">
          <BloomLogo className="h-12 w-12 text-pink-500 mb-2" />
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Mother's <span className="text-pink-500">Bloom</span>
          </h1>
          <p className="text-gray-500 mt-2">{isLogin ? 'Welcome back, mama!' : 'Join our community'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., MamaBear22"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors disabled:bg-pink-300"
            disabled={!username.trim() || !password.trim()}
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={() => handleSocialLogin('Google')} className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            <GoogleIcon /> Google
          </button>
          <button onClick={() => handleSocialLogin('Facebook')} className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            <FacebookIcon /> Facebook
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => setIsLogin(!isLogin)} className="font-semibold text-pink-500 hover:text-pink-600 ml-1">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
