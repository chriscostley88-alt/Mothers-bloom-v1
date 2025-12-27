
import React, { useState } from 'react';
import { generateMealPlan, generateMeditationAudio, decode, decodeAudioData } from '../services/geminiService';
import { MealPlan, User } from '../types';
import { SparklesIcon, PlayIcon, VolumeIcon } from './icons';

const WellnessHub: React.FC<{ user: User }> = ({ user }) => {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);

  if (!user.isPremium) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center text-center bg-gradient-to-b from-amber-50 to-white">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6 shadow-xl">
           <SparklesIcon className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Bloom+ Wellness</h2>
        <p className="text-gray-500 mb-8 px-8">Unlock trimester-specific meal plans and AI-generated meditation sessions for just $4.99/mo.</p>
        <button className="px-8 py-3 bg-amber-500 text-white rounded-full font-bold shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all">
          Upgrade to Bloom+
        </button>
      </div>
    );
  }

  const handleGetMeals = async () => {
    setLoading(true);
    try {
      const plan = await generateMealPlan(1); // Default to trimester 1 for demo
      setMealPlan(plan);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMeditation = async () => {
    setPlaying(true);
    try {
      const base64 = await generateMeditationAudio("calm");
      if (base64) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const buffer = await decodeAudioData(decode(base64), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
        source.onended = () => setPlaying(false);
      }
    } catch (e) {
      console.error(e);
      setPlaying(false);
    }
  };

  return (
    <div className="p-6 h-full bg-slate-50 overflow-y-auto pb-12">
      <div className="flex items-center gap-2 mb-8">
        <SparklesIcon className="w-6 h-6 text-amber-500" />
        <h2 className="text-2xl font-bold text-gray-800">Premium Wellness Hub</h2>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100 mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <VolumeIcon className="w-5 h-5 text-amber-500" />
          AI Relaxation Session
        </h3>
        <p className="text-sm text-gray-500 mb-6">A unique meditation script generated just for your current week and mood.</p>
        <button 
          onClick={handleMeditation}
          disabled={playing}
          className="w-full py-4 bg-amber-500 text-white rounded-xl font-bold flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {playing ? <div className="animate-pulse">Speaking...</div> : <><PlayIcon className="w-5 h-5" /> Start Meditation</>}
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Trimester Meal Plan</h3>
        <p className="text-sm text-gray-500 mb-6">Expert-backed nutrition for you and your baby.</p>
        
        {!mealPlan ? (
          <button 
            onClick={handleGetMeals}
            disabled={loading}
            className="w-full py-3 border-2 border-amber-500 text-amber-600 rounded-xl font-bold hover:bg-amber-50 transition-all"
          >
            {loading ? "Generating Plan..." : "Generate 3-Day Plan"}
          </button>
        ) : (
          <div className="space-y-4">
            {['Day 1', 'Day 2', 'Day 3'].map((day, i) => (
              <div key={day} className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <h4 className="font-bold text-amber-800 mb-2">{day}</h4>
                <ul className="text-xs text-amber-700 space-y-1 list-disc pl-4">
                  {(mealPlan as any)[`day${i+1}`].map((m: string, idx: number) => <li key={idx}>{m}</li>)}
                </ul>
              </div>
            ))}
            <div className="p-4 bg-blue-50 rounded-xl text-xs text-blue-700">
              <p className="font-bold mb-1">Coach's Tip:</p>
              {mealPlan.tips}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WellnessHub;
