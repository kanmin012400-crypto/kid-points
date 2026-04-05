// Firebase 配置
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// 用户和孩子信息
export interface Child {
  name: string;
  avatarEmoji: string;
  birthday: string;
  totalPoints: number;
}

export interface Parent {
  name: string;
}

export interface UserData {
  child: Child;
  parents: Parent[];
}

// 习惯
export interface Habit {
  id: string;
  name: string;
  emoji: string;
  type: 'reward' | 'punish';
  points: number;
  order: number;
  userId: string;
  createdAt?: Date;
}

// 积分记录
export interface Transaction {
  id: string;
  habitId: string;
  habitName: string;
  points: number;
  note?: string | null;
  createdBy: string;
  createdAt: Date;
  isReverted: boolean;
  revertedAt?: Date;
  userId: string;
}

// 礼品
export interface Gift {
  id: string;
  name: string;
  photoUrl?: string;
  emoji?: string;
  type: 'physical' | 'privilege';
  priceYuan?: number;
  points: number;
  order: number;
  userId: string;
  createdAt?: Date;
}

// 兑换记录
export interface Redemption {
  id: string;
  giftId: string;
  giftName: string;
  pointsCost: number;
  createdBy: string;
  createdAt: Date;
  userId: string;
}

// 设置
export interface Level {
  name: string;
  minPoints: number;
}

export interface Settings {
  pointsPerYuan: number;
  levels: Level[];
}

// 统计
export interface StatsData {
  rewardPoints: number;
  punishPoints: number;
  netPoints: number;
  redemptionCount: number;
  streak: number;
  habitRanks: { habitName: string; count: number }[];
  dailyPoints: { date: string; points: number }[];
}
