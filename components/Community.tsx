
import React, { useState, useMemo, useEffect } from 'react';
import type { CommunityPost, User, MamaMatch } from '../types';
import { getCommunityPulse, findMamaMatches } from '../services/geminiService';
import { HeartIcon, CommentIcon, PaperAirplaneIcon, MapPinIcon, SparklesIcon, UsersIcon } from './icons';

const mockPosts: CommunityPost[] = [
  {
    id: 1,
    author: 'MamaBear22',
    avatarUrl: 'https://picsum.photos/seed/1/40/40',
    timeAgo: '2h ago',
    content: 'First ultrasound today! So excited and nervous. Any tips for a first-timer? 🥰',
    likes: 42,
    comments: 12,
    distance: '0.5 km',
    isPremiumPost: true,
  },
  {
    id: 2,
    author: 'Jenna_P',
    avatarUrl: 'https://picsum.photos/seed/2/40/40',
    timeAgo: '5h ago',
    content: 'My little one is teething and SO grumpy. We\'ve tried everything! Cold teethers, amber necklace... what worked for you all?',
    likes: 18,
    comments: 25,
    distance: '1.2 km',
  },
  {
    id: 3,
    author: 'SoonToBeMommy',
    avatarUrl: 'https://picsum.photos/seed/3/40/40',
    timeAgo: '1d ago',
    content: 'Feeling those third-trimester Braxton Hicks contractions. They are so weird! Anyone else experience this a lot?',
    likes: 67,
    comments: 31,
    distance: '2.8 km',
    circle: 'Third Trimester',
  },
];

const CIRCLES = ["General", "First-Time Mamas", "Third Trimester", "Nutrition & Health", "Postpartum"];

const PostCard: React.FC<{ post: CommunityPost; showDistance?: boolean }> = ({ post, showDistance }) => (
  <div className={`bg-white p-4 rounded-xl shadow-sm border mb-4 transition-all hover:shadow-md ${post.isPremiumPost ? 'border-amber-200 ring-1 ring-amber-50' : 'border-gray-100'}`}>
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center">
        <img src={post.avatarUrl} alt={post.author} className="w-10 h-10 rounded-full mr-3 border-2 border-pink-50" />
        <div>
          <div className="flex items-center gap-1.5">
            <p className="font-bold text-gray-800 text-sm">{post.author}</p>
            {post.isPremiumPost && <div className="bg-amber-100 text-amber-600 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">Bloom+</div>}
          </div>
          <p className="text-[10px] text-gray-400 flex items-center gap-1">
            {post.timeAgo}
            {showDistance && post.distance && (
              <span className="flex items-center text-pink-500 font-semibold ml-2">
                <MapPinIcon className="w-2.5 h-2.5 mr-0.5" />
                {post.distance}
              </span>
            )}
            {post.circle && (
               <span className="ml-2 bg-blue-50 text-blue-500 px-1.5 rounded-sm font-medium">{post.circle}</span>
            )}
          </p>
        </div>
      </div>
    </div>
    <p className="text-gray-700 text-sm leading-relaxed mb-4">{post.content}</p>
    <div className="flex items-center text-gray-400 text-xs">
      <div className="flex items-center mr-6 hover:text-pink-500 cursor-pointer transition-colors">
        <HeartIcon className="w-4 h-4 mr-1" />
        <span>{post.likes}</span>
      </div>
      <div className="flex items-center hover:text-blue-500 cursor-pointer transition-colors">
        <CommentIcon className="w-4 h-4 mr-1" />
        <span>{post.comments}</span>
      </div>
    </div>
  </div>
);

const Community: React.FC<{ user: User }> = ({ user }) => {
  const [posts, setPosts] = useState(mockPosts);
  const [newPost, setNewPost] = useState('');
  const [tab, setTab] = useState<'global' | 'nearby' | 'matches'>('global');
  const [activeCircle, setActiveCircle] = useState("General");
  const [pulseSummary, setPulseSummary] = useState<string | null>(null);
  const [matches, setMatches] = useState<MamaMatch[]>([]);
  const [loadingPulse, setLoadingPulse] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);

  useEffect(() => {
    if (user.isPremium) {
      setLoadingPulse(true);
      const postContents = posts.map(p => p.content).slice(0, 5);
      getCommunityPulse(postContents).then(sum => {
        setPulseSummary(sum);
        setLoadingPulse(false);
      });
    }
  }, [user.isPremium]);

  const handleMatchFind = async () => {
    setLoadingMatches(true);
    try {
      const res = await findMamaMatches(user.currentWeek || 20, user.interests || ["yoga", "cooking"]);
      setMatches(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMatches(false);
    }
  };

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (tab === 'nearby') result = posts.filter(p => !!p.distance);
    if (activeCircle !== "General") result = result.filter(p => p.circle === activeCircle);
    return result;
  }, [posts, tab, activeCircle]);

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const newPostData: CommunityPost = {
      id: Date.now(),
      author: user.username,
      avatarUrl: `https://picsum.photos/seed/${user.username}/40/40`,
      timeAgo: 'Just now',
      content: newPost,
      likes: 0,
      comments: 0,
      distance: user.location ? '0 km' : undefined,
      isPremiumPost: user.isPremium,
      circle: activeCircle !== "General" ? activeCircle : undefined
    };

    setPosts([newPostData, ...posts]);
    setNewPost('');
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col">
      <div className="bg-white px-4 py-2 border-b border-gray-100 flex gap-4 sticky top-0 z-10 shadow-sm overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setTab('global')}
          className={`px-4 py-2 text-sm font-bold transition-all whitespace-nowrap rounded-full ${tab === 'global' ? 'text-pink-600 bg-pink-50' : 'text-gray-400'}`}
        >
          Global
        </button>
        <button 
          onClick={() => setTab('nearby')}
          className={`px-4 py-2 text-sm font-bold transition-all whitespace-nowrap rounded-full flex items-center gap-1.5 ${tab === 'nearby' ? 'text-pink-600 bg-pink-50' : 'text-gray-400'}`}
        >
          <MapPinIcon className="w-3.5 h-3.5" />
          Nearby
        </button>
        {user.isPremium && (
          <button 
            onClick={() => setTab('matches')}
            className={`px-4 py-2 text-sm font-bold transition-all whitespace-nowrap rounded-full flex items-center gap-1.5 ${tab === 'matches' ? 'text-amber-600 bg-amber-50' : 'text-gray-400'}`}
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            Mama-Match
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {user.isPremium && tab !== 'matches' && (
          <div className="mb-6 bg-gradient-to-r from-amber-500 to-amber-600 p-4 rounded-2xl shadow-lg shadow-amber-200 text-white relative overflow-hidden">
             <div className="relative z-10">
               <div className="flex items-center gap-2 mb-1">
                 <SparklesIcon className="w-4 h-4" />
                 <h3 className="text-xs font-bold uppercase tracking-widest">Local Pulse</h3>
               </div>
               {loadingPulse ? (
                 <div className="h-4 w-48 bg-white/20 animate-pulse rounded"></div>
               ) : (
                 <p className="text-sm font-medium leading-relaxed opacity-95 italic">"{pulseSummary}"</p>
               )}
             </div>
             <SparklesIcon className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 rotate-12" />
          </div>
        )}

        {tab === 'matches' ? (
          <div className="space-y-6">
            <div className="text-center py-6 bg-white rounded-3xl border border-amber-100 p-6 shadow-sm">
               <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UsersIcon className="w-8 h-8 text-amber-600" />
               </div>
               <h3 className="text-xl font-bold text-gray-800 mb-2">Bloom+ Matchmaking</h3>
               <p className="text-sm text-gray-500 mb-6">Find mamas at your exact week of pregnancy or with similar interests.</p>
               <button 
                onClick={handleMatchFind}
                disabled={loadingMatches}
                className="px-8 py-3 bg-amber-500 text-white rounded-full font-bold shadow-lg shadow-amber-200 disabled:opacity-50"
               >
                 {loadingMatches ? "Analyzing mamas..." : "Find My Match"}
               </button>
            </div>

            {matches.map((match, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-amber-100 shadow-sm flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <img src={match.avatarUrl} className="w-16 h-16 rounded-full border-4 border-amber-50 shadow-inner" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-gray-800">{match.username}</h4>
                    <span className="text-amber-600 font-bold text-sm bg-amber-50 px-2 py-0.5 rounded-full">{match.compatibility}% Match</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{match.reason}</p>
                  <button className="mt-3 text-xs font-bold text-pink-500 hover:text-pink-600">Say Hello 👋</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-6 flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {CIRCLES.map(c => (
                <button 
                  key={c}
                  onClick={() => setActiveCircle(c)}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-full border transition-all whitespace-nowrap ${activeCircle === c ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-400 border-gray-100'}`}
                >
                  {c}
                </button>
              ))}
            </div>

            <form onSubmit={handlePostSubmit} className={`mb-8 bg-white p-4 rounded-2xl shadow-sm border transition-all ${user.isPremium ? 'border-amber-100 shadow-amber-50' : 'border-pink-100'}`}>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder={`What's on your mind, ${user.username}?`}
                className="w-full p-0 text-sm border-none focus:ring-0 placeholder-gray-300 transition resize-none bg-transparent"
                rows={2}
              ></textarea>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                 <div className="text-[10px] text-gray-400 flex items-center gap-1">
                   {user.isPremium && <SparklesIcon className="w-3 h-3 text-amber-500" />}
                   {activeCircle !== "General" ? `Posting in ${activeCircle}` : "Public Feed"}
                 </div>
                 <button
                  type="submit"
                  className={`p-2 rounded-full text-white transition-all shadow-md ${user.isPremium ? 'bg-amber-500 shadow-amber-100' : 'bg-pink-500 shadow-pink-100'}`}
                  disabled={!newPost.trim()}
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {filteredPosts.map(post => (
                <PostCard key={post.id} post={post} showDistance={tab === 'nearby'} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Community;
