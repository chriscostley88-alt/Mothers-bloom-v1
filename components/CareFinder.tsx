
import React, { useState } from 'react';
import { User, HealthcareProvider } from '../types';
import { findNearbyHealthcare } from '../services/geminiService';
import { HospitalIcon, SearchIcon, ExternalLinkIcon } from './icons';

interface CareFinderProps {
  user: User;
}

const CARE_CATEGORIES = [
  { id: 'obgyn', label: 'OB-GYN', icon: '🤰' },
  { id: 'pediatrician', label: 'Pediatricians', icon: '👶' },
  { id: 'midwife', label: 'Midwives', icon: '🤱' },
  { id: 'lactation', label: 'Lactation Consultants', icon: '🍼' },
];

const CareFinder: React.FC<CareFinderProps> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<HealthcareProvider[]>([]);
  const [aiText, setAiText] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const searchCare = async (query: string) => {
    if (!user.location) {
      alert("Please enable location services to find providers near you.");
      return;
    }
    
    setLoading(true);
    setActiveCategory(query);
    try {
      const { text, providers } = await findNearbyHealthcare(query, user.location.lat, user.location.lng);
      setAiText(text);
      setResults(providers);
    } catch (error) {
      console.error("Failed to find care:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 h-full bg-slate-50 overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Find Local Care</h2>
        <p className="text-gray-500 text-sm">Connect with medical professionals in your neighborhood.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {CARE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => searchCare(cat.label)}
            disabled={loading}
            className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 ${
              activeCategory === cat.label
                ? 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-200'
                : 'bg-white border-gray-100 text-gray-700 hover:border-pink-300'
            }`}
          >
            <span className="text-2xl">{cat.icon}</span>
            <span className="font-semibold text-sm">{cat.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-pink-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-pink-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-pink-600 font-medium animate-pulse">Searching your area...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-4 pb-12">
          <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm mb-6 border border-blue-100">
            <p className="font-bold mb-1">Bloom's Local Finds:</p>
            <p className="opacity-90">{aiText}</p>
          </div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Top Rated Results</h3>
          {results.map((provider, i) => (
            <a
              key={i}
              href={provider.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                  <HospitalIcon className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 group-hover:text-pink-600 transition-colors">{provider.title}</h4>
                  <p className="text-xs text-gray-400">View on Google Maps</p>
                </div>
              </div>
              <ExternalLinkIcon className="w-5 h-5 text-gray-300 group-hover:text-pink-400" />
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <HospitalIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">Select a category above to find specialists near you.</p>
        </div>
      )}
    </div>
  );
};

export default CareFinder;
