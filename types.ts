
export type View = 'chat' | 'tracker' | 'care' | 'community' | 'wellness' | 'profile';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface CommunityPost {
  id: number;
  author: string;
  avatarUrl: string;
  timeAgo: string;
  content: string;
  likes: number;
  comments: number;
  distance?: string;
  isPremiumPost?: boolean;
  circle?: string;
}

export interface User {
  username: string;
  isPremium?: boolean;
  interests?: string[];
  currentWeek?: number;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface HealthcareProvider {
  title: string;
  uri: string;
  address?: string;
  rating?: string;
}

export interface MealPlan {
  day1: string[];
  day2: string[];
  day3: string[];
  tips: string;
}

export interface MamaMatch {
  username: string;
  compatibility: number;
  reason: string;
  avatarUrl: string;
}
