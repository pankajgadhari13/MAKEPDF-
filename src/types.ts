export type ActiveView = 
  | 'home' 
  | 'tools' 
  | 'jpg-to-pdf' 
  | 'merge-pdf' 
  | 'split-pdf' 
  | 'compress-pdf' 
  | 'pdf-to-jpg' 
  | 'rotate-pdf' 
  | 'watermark-pdf' 
  | 'protect-pdf' 
  | 'inspect-pdf' 
  | 'word-to-pdf' 
  | 'dashboard' 
  | 'history' 
  | 'pricing' 
  | 'faq'
  | 'about'
  | 'phase1-console'
  | 'admin';

export interface ProcessedItem {
  id: string;
  filename: string;
  tool: string;
  date: string;
  size: string;
  status: 'Completed' | 'Processing' | 'Failed';
  downloadUrl?: string;
}

export interface UserState {
  isLoggedIn: boolean;
  name: string;
  email: string;
  avatarUrl?: string;
  filesProcessed: number;
  pdfsCreated: number;
  storageUsedMb: number;
  isAdmin?: boolean;
}

export interface VisitorRecord {
  id: string;
  visitorId: string;
  timestamp: string;
  page: string;
  device: string;
  browser: string;
  referrer: string;
  isUniqueToday?: boolean;
}

export interface UserLoginRecord {
  id: string;
  email: string;
  name: string;
  timestamp: string;
  method: string;
  role: 'admin' | 'user';
  device: string;
  avatarUrl?: string;
}

export interface TrackedUser {
  email: string;
  name: string;
  avatarUrl?: string;
  role: 'admin' | 'user';
  loginCount: number;
  lastLogin: string;
  firstJoined: string;
  status: 'active' | 'idle' | 'suspended';
  filesProcessed?: number;
}

export interface AnalyticsData {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  totalLogins: number;
  uniqueLoggedInUsers: number;
  visitors: VisitorRecord[];
  logins: UserLoginRecord[];
  users: TrackedUser[];
  pageViews: Record<string, number>;
  lastUpdated: string;
}
