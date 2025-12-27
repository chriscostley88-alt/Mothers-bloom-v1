
import React, { useState, useEffect, useMemo } from 'react';
import { getPregnancyUpdate, PregnancyUpdate, generateBabyArt } from '../services/geminiService';
import { User } from '../types';
import { SparklesIcon } from './icons';

const Tracker: React.FC<{ user: User }> = ({ user }) => {
    const [dueDate, setDueDate] = useState<string | null>(() => localStorage.getItem('dueDate'));
    const [inputDate, setInputDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [trackingData, setTrackingData] = useState<PregnancyUpdate | null>(null);
    const [babyArt, setBabyArt] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'baby' | 'mom'>('baby');

    const currentWeek = useMemo(() => {
        if (!dueDate) return null;
        const dueDateObj = new Date(dueDate);
        const today = new Date();
        const msPerDay = 1000 * 60 * 60 * 24;
        const daysRemaining = Math.ceil((dueDateObj.getTime() - today.getTime()) / msPerDay);
        if (daysRemaining > 280 || daysRemaining < -14) return null;
        const daysPregnant = 280 - daysRemaining;
        return Math.floor(daysPregnant / 7) + 1;
    }, [dueDate]);

    useEffect(() => {
        if (currentWeek && currentWeek > 0 && currentWeek <= 42) {
            const fetchUpdate = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const data = await getPregnancyUpdate(currentWeek);
                    setTrackingData(data);
                    if (user.isPremium) {
                        const art = await generateBabyArt(data.babySize);
                        setBabyArt(art);
                    }
                } catch (err) {
                    setError('Could not fetch weekly update.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchUpdate();
        }
    }, [currentWeek, user.isPremium]);

    const handleSaveDate = () => {
        localStorage.setItem('dueDate', inputDate);
        setDueDate(inputDate);
    };

    const handleReset = () => {
        localStorage.removeItem('dueDate');
        setDueDate(null);
        setTrackingData(null);
        setBabyArt(null);
    }

    if (!dueDate || !currentWeek) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 bg-white text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Pregnancy Tracker</h2>
                <p className="text-gray-600 mb-6">Enter your estimated due date to get started!</p>
                <div className="w-full max-w-sm">
                     <input
                        type="date"
                        value={inputDate}
                        onChange={(e) => setInputDate(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                    <button
                        onClick={handleSaveDate}
                        className="w-full py-3 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors"
                    >
                        Start Tracking
                    </button>
                </div>
            </div>
        );
    }

    const progressPercentage = (currentWeek / 40) * 100;

    return (
        <div className="h-full bg-slate-50 p-4 md:p-6 overflow-y-auto pb-12">
            {user.isPremium && babyArt && (
              <div className="mb-6 relative group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl z-10"></div>
                <img src={babyArt} alt="Baby AI Art" className="w-full h-64 object-cover rounded-2xl shadow-xl shadow-amber-100" />
                <div className="absolute bottom-4 left-4 z-20">
                  <div className="flex items-center gap-1.5 bg-amber-500/90 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                    <SparklesIcon className="w-3 h-3" /> Bloom+ Vision
                  </div>
                  <h3 className="text-white font-bold mt-1">Week {currentWeek} Artistic Perspective</h3>
                </div>
              </div>
            )}

            <div className={`bg-white p-5 rounded-xl shadow-md border ${user.isPremium ? 'border-amber-100' : 'border-pink-50'}`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className={`text-2xl font-bold ${user.isPremium ? 'text-amber-500' : 'text-pink-500'}`}>Week {currentWeek}</h2>
                     <button onClick={handleReset} className="text-sm text-gray-500 hover:text-pink-600">Reset</button>
                </div>
                
                <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                    <div className={`${user.isPremium ? 'bg-amber-400' : 'bg-pink-400'} h-2.5 rounded-full transition-all duration-1000`} style={{ width: `${progressPercentage}%` }}></div>
                </div>
                <p className="text-xs text-right text-gray-400 mb-4">You're {Math.round(progressPercentage)}% through your journey!</p>

                {isLoading ? (
                     <div className="flex justify-center items-center h-48">
                        <div className="flex items-center space-x-2 animate-pulse">
                            <span className={`h-3 w-3 ${user.isPremium ? 'bg-amber-400' : 'bg-pink-400'} rounded-full`}></span>
                            <span className={`h-3 w-3 ${user.isPremium ? 'bg-amber-400' : 'bg-pink-400'} rounded-full`}></span>
                            <span className={`h-3 w-3 ${user.isPremium ? 'bg-amber-400' : 'bg-pink-400'} rounded-full`}></span>
                        </div>
                     </div>
                ) : trackingData && (
                    <div>
                        <div className={`text-center ${user.isPremium ? 'bg-amber-50' : 'bg-pink-50'} rounded-lg p-4 mb-6 border ${user.isPremium ? 'border-amber-100' : 'border-pink-100'}`}>
                            <p className="text-gray-500 text-xs mb-1">Your baby is about the size of a</p>
                            <p className={`text-xl font-bold ${user.isPremium ? 'text-amber-600' : 'text-pink-600'}`}>{trackingData.babySize}</p>
                        </div>

                        <div className="flex border-b border-gray-100 mb-6">
                            <button onClick={() => setActiveTab('baby')} className={`flex-1 py-3 text-sm font-bold transition-all ${activeTab === 'baby' ? (user.isPremium ? 'text-amber-600 border-b-2 border-amber-600' : 'text-pink-600 border-b-2 border-pink-600') : 'text-gray-400'}`}>
                                Development
                            </button>
                             <button onClick={() => setActiveTab('mom')} className={`flex-1 py-3 text-sm font-bold transition-all ${activeTab === 'mom' ? (user.isPremium ? 'text-amber-600 border-b-2 border-amber-600' : 'text-pink-600 border-b-2 border-pink-600') : 'text-gray-400'}`}>
                                Symptoms
                            </button>
                        </div>
                        
                        <div className="text-gray-600 text-sm leading-relaxed px-1">
                            {activeTab === 'baby' ? <p>{trackingData.babyDevelopment}</p> : <p>{trackingData.momSymptoms}</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tracker;
