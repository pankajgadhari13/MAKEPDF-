import { AnalyticsData, TrackedUser, UserLoginRecord, VisitorRecord } from '../types';

export const ADMIN_CREDENTIALS = {
  email: 'pankajgadhari154@gmail.com',
  password: 'Pass@123',
  name: 'Pankaj Gadhari (Super Admin)',
};

const STORAGE_KEY = 'makepdf_analytics_v4_real';
const VISITOR_ID_KEY = 'makepdf_visitor_uuid';

function getOrGenerateVisitorId(): string {
  let vid = localStorage.getItem(VISITOR_ID_KEY);
  if (!vid) {
    vid = 'vst_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    localStorage.setItem(VISITOR_ID_KEY, vid);
  }
  return vid;
}

function detectDevice(): string {
  if (typeof window === 'undefined') return 'Desktop';
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return 'Android Device';
  if (/iPad/i.test(ua)) return 'iPad Tablet';
  if (/iPhone|iPod/i.test(ua)) return 'iOS Mobile';
  if (/Tablet/i.test(ua)) return 'Tablet Device';
  if (/Macintosh/i.test(ua)) return 'Mac Laptop / Desktop';
  if (/Windows/i.test(ua)) return 'Windows Laptop / PC';
  if (/Linux/i.test(ua)) return 'Linux Workstation';
  return 'Desktop Web';
}

function detectBrowser(): string {
  if (typeof window === 'undefined') return 'Chrome';
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg/')) return 'Microsoft Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  return 'Web Browser';
}

/**
 * Scan real registered accounts and current active sessions
 * Strictly zero fake data - only authentic accounts that exist.
 */
export function getRealRegisteredUsers(loginsList: UserLoginRecord[] = []): TrackedUser[] {
  const users: TrackedUser[] = [];

  const currentRaw = localStorage.getItem('makepdf_current_user');
  let currentObj: any = null;
  try {
    if (currentRaw) currentObj = JSON.parse(currentRaw);
  } catch {}

  const isCurrentAdmin = currentObj?.isLoggedIn && currentObj?.email?.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase();
  const adminLogins = loginsList.filter(l => l.email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase());

  // Verified Super Admin account
  users.push({
    email: ADMIN_CREDENTIALS.email,
    name: 'Pankaj Gadhari',
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Pankaj&backgroundColor=ff5722,ea580c,f97316&textColor=ffffff&bold=true',
    role: 'admin',
    loginCount: adminLogins.length + (isCurrentAdmin && adminLogins.length === 0 ? 1 : 0),
    lastLogin: adminLogins[0]?.timestamp || (isCurrentAdmin ? 'Active now' : 'Never signed in yet'),
    firstJoined: 'Super Admin Account',
    status: isCurrentAdmin ? 'active' : (adminLogins.length > 0 ? 'active' : 'idle'),
    filesProcessed: isCurrentAdmin ? (currentObj?.filesProcessed || 0) : 0,
  });

  // Real registered users in localStorage ('makepdf_local_users')
  try {
    const rawLocalUsers = localStorage.getItem('makepdf_local_users');
    if (rawLocalUsers) {
      const parsed = JSON.parse(rawLocalUsers);
      for (const email of Object.keys(parsed)) {
        const item = parsed[email];
        if (email.toLowerCase() !== ADMIN_CREDENTIALS.email.toLowerCase()) {
          const userLogins = loginsList.filter(l => l.email.toLowerCase() === email.toLowerCase());
          const isUserCurrent = currentObj?.isLoggedIn && currentObj?.email?.toLowerCase() === email.toLowerCase();
          users.push({
            email: item.email || email,
            name: item.name || email.split('@')[0],
            avatarUrl: item.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.name || email)}&backgroundColor=0284c7&textColor=ffffff`,
            role: 'user',
            loginCount: userLogins.length + (isUserCurrent && userLogins.length === 0 ? 1 : 0),
            lastLogin: userLogins[0]?.timestamp || (isUserCurrent ? 'Active now' : 'Registered'),
            firstJoined: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
            status: isUserCurrent ? 'active' : (userLogins.length > 0 ? 'active' : 'idle'),
            filesProcessed: isUserCurrent ? (currentObj?.filesProcessed || 0) : 0,
          });
        }
      }
    }
  } catch (e) {
    console.warn('Could not read real local users:', e);
  }

  // Current session user if not yet in users
  if (currentObj && currentObj.email && !users.some((u) => u.email.toLowerCase() === currentObj.email.toLowerCase())) {
    users.push({
      email: currentObj.email,
      name: currentObj.name || currentObj.email.split('@')[0],
      avatarUrl: currentObj.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentObj.name || currentObj.email)}&backgroundColor=10b981&textColor=ffffff`,
      role: currentObj.isAdmin ? 'admin' : 'user',
      loginCount: 1,
      lastLogin: 'Active now',
      firstJoined: 'Current Session',
      status: 'active',
      filesProcessed: currentObj.filesProcessed || 0,
    });
  }

  return users;
}

function getInitialAnalytics(): AnalyticsData {
  const currentRaw = localStorage.getItem('makepdf_current_user');
  let currentObj: any = null;
  try {
    if (currentRaw) currentObj = JSON.parse(currentRaw);
  } catch {}

  const realUsers = getRealRegisteredUsers([]);
  const hasLoggedInUser = !!(currentObj && currentObj.isLoggedIn);

  return {
    totalVisits: 1, // Current real session
    uniqueVisitors: 1,
    todayVisits: 1,
    totalLogins: hasLoggedInUser ? 1 : 0,
    uniqueLoggedInUsers: hasLoggedInUser ? 1 : 0,
    visitors: [],
    logins: [],
    users: realUsers,
    pageViews: {
      'Home': 1,
    },
    lastUpdated: new Date().toISOString(),
  };
}

export function getAnalyticsData(): AnalyticsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialAnalytics();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const data: AnalyticsData = JSON.parse(raw);

    if (!Array.isArray(data.logins)) data.logins = [];
    if (!Array.isArray(data.visitors)) data.visitors = [];
    if (!Array.isArray(data.users)) data.users = [];
    if (!data.pageViews) data.pageViews = {};

    // Strictly ensure totalLogins reflects real login records
    if (data.logins.length === 0) {
      const currentRaw = localStorage.getItem('makepdf_current_user');
      let currentObj: any = null;
      try {
        if (currentRaw) currentObj = JSON.parse(currentRaw);
      } catch {}
      data.totalLogins = currentObj?.isLoggedIn ? 1 : 0;
    } else {
      data.totalLogins = Math.max(data.totalLogins, data.logins.length);
    }

    // Refresh real registered users with actual login count
    const updatedUsers = getRealRegisteredUsers(data.logins);
    data.users = updatedUsers;
    data.uniqueLoggedInUsers = updatedUsers.filter(u => u.loginCount > 0 || u.status === 'active').length;

    return data;
  } catch {
    return getInitialAnalytics();
  }
}

export function saveAnalyticsData(data: AnalyticsData): void {
  try {
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save analytics:', err);
  }
}

export function recordWebsiteVisit(pageName: string = 'Home'): void {
  const data = getAnalyticsData();
  const visitorId = getOrGenerateVisitorId();
  const now = new Date();
  const timeStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
                  now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Check if visitor has visited today
  const hasVisitedToday = data.visitors.some(
    (v) => v.visitorId === visitorId && new Date(v.timestamp).toDateString?.() === now.toDateString()
  );

  data.totalVisits += 1;
  data.todayVisits += 1;
  if (!hasVisitedToday) {
    data.uniqueVisitors += 1;
  }

  // Update page views
  const normalizedPage = pageName.trim() || 'Home';
  data.pageViews[normalizedPage] = (data.pageViews[normalizedPage] || 0) + 1;

  // Prepend visitor record
  const newRecord: VisitorRecord = {
    id: 'vis-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
    visitorId,
    timestamp: timeStr,
    page: normalizedPage,
    device: detectDevice(),
    browser: detectBrowser(),
    referrer: document.referrer ? (new URL(document.referrer).hostname || 'Direct') : 'Direct Access',
    isUniqueToday: !hasVisitedToday,
  };

  data.visitors = [newRecord, ...data.visitors.slice(0, 99)];
  saveAnalyticsData(data);
}

export function recordUserLogin(
  user: { email: string; name: string; avatarUrl?: string },
  method: string = 'User Sign In'
): void {
  const data = getAnalyticsData();
  const now = new Date();
  const timeStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
                  now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  data.totalLogins += 1;

  const isAdmin = user.email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase();

  // Find or insert user in tracked users
  const existingUserIndex = data.users.findIndex(
    (u) => u.email.toLowerCase() === user.email.toLowerCase()
  );

  if (existingUserIndex >= 0) {
    data.users[existingUserIndex].loginCount += 1;
    data.users[existingUserIndex].lastLogin = timeStr;
    data.users[existingUserIndex].status = 'active';
    if (user.avatarUrl) data.users[existingUserIndex].avatarUrl = user.avatarUrl;
    if (isAdmin) data.users[existingUserIndex].role = 'admin';
  } else {
    data.uniqueLoggedInUsers += 1;
    data.users.unshift({
      email: user.email,
      name: user.name || user.email.split('@')[0],
      avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=ff5722`,
      role: isAdmin ? 'admin' : 'user',
      loginCount: 1,
      lastLogin: timeStr,
      firstJoined: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'active',
      filesProcessed: 0,
    });
  }

  // Prepend login record
  const newLoginRecord: UserLoginRecord = {
    id: 'log-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
    email: user.email,
    name: user.name || user.email.split('@')[0],
    timestamp: timeStr,
    method: isAdmin ? 'Super Admin Authentication' : method,
    role: isAdmin ? 'admin' : 'user',
    device: detectDevice(),
    avatarUrl: user.avatarUrl,
  };

  data.logins = [newLoginRecord, ...data.logins.slice(0, 99)];
  saveAnalyticsData(data);
}

export function verifyAdminCredentials(email: string, pass: string): boolean {
  return (
    email.trim().toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase() &&
    pass.trim() === ADMIN_CREDENTIALS.password
  );
}

export function isAdminEmail(email?: string): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase();
}

export function recordUserRegistration(
  user: { email: string; name: string; avatarUrl?: string }
): void {
  const data = getAnalyticsData();
  const now = new Date();
  const timeStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const isAdmin = user.email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase();

  const existingUserIndex = data.users.findIndex(
    (u) => u.email.toLowerCase() === user.email.toLowerCase()
  );

  if (existingUserIndex >= 0) {
    data.users[existingUserIndex].status = 'active';
    if (user.avatarUrl) data.users[existingUserIndex].avatarUrl = user.avatarUrl;
  } else {
    data.users.push({
      email: user.email,
      name: user.name || user.email.split('@')[0],
      avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=0284c7&textColor=ffffff`,
      role: isAdmin ? 'admin' : 'user',
      loginCount: 0,
      lastLogin: 'Never (Registered)',
      firstJoined: timeStr,
      status: 'idle',
      filesProcessed: 0,
    });
  }

  saveAnalyticsData(data);
}

/**
 * Merge live Firestore users into analytics
 */
export function syncFirestoreUsersIntoAnalytics(firestoreUsers: any[]): AnalyticsData {
  const data = getAnalyticsData();
  const existingEmails = new Set(data.users.map((u) => u.email.toLowerCase()));

  for (const fu of firestoreUsers) {
    if (!fu.email) continue;
    const emailLower = fu.email.toLowerCase();
    const isSuperAdmin = emailLower === ADMIN_CREDENTIALS.email.toLowerCase();
    const userLogins = data.logins.filter((l) => l.email.toLowerCase() === emailLower);

    if (existingEmails.has(emailLower)) {
      const target = data.users.find((u) => u.email.toLowerCase() === emailLower);
      if (target) {
        if (fu.name) target.name = fu.name;
        if (fu.avatarUrl) target.avatarUrl = fu.avatarUrl;
        if (fu.createdAt) {
          target.firstJoined = new Date(fu.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        }
        target.filesProcessed = Math.max(target.filesProcessed || 0, fu.filesProcessed || 0);
      }
    } else {
      data.users.push({
        email: fu.email,
        name: fu.name || fu.email.split('@')[0],
        avatarUrl:
          fu.avatarUrl ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fu.name || fu.email)}&backgroundColor=0284c7&textColor=ffffff`,
        role: isSuperAdmin ? 'admin' : fu.role || 'user',
        loginCount: userLogins.length,
        lastLogin: userLogins[0]?.timestamp || 'Registered in Firebase',
        firstJoined: fu.createdAt
          ? new Date(fu.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'Firebase User',
        status: userLogins.length > 0 ? 'active' : 'idle',
        filesProcessed: fu.filesProcessed || 0,
      });
      existingEmails.add(emailLower);
    }
  }

  data.uniqueLoggedInUsers = data.users.filter((u) => u.loginCount > 0 || u.status === 'active').length;
  saveAnalyticsData(data);
  return data;
}

export function updateTrackedUser(email: string, updates: Partial<TrackedUser>): AnalyticsData {
  const data = getAnalyticsData();
  const emailLower = email.toLowerCase();
  const targetIndex = data.users.findIndex((u) => u.email.toLowerCase() === emailLower);

  if (targetIndex >= 0) {
    data.users[targetIndex] = {
      ...data.users[targetIndex],
      ...updates,
    };

    // Also sync to makepdf_local_users if exists
    try {
      const rawLocal = localStorage.getItem('makepdf_local_users');
      if (rawLocal) {
        const parsed = JSON.parse(rawLocal);
        if (parsed[emailLower]) {
          parsed[emailLower] = {
            ...parsed[emailLower],
            name: updates.name ?? parsed[emailLower].name,
            role: updates.role ?? parsed[emailLower].role,
            status: updates.status ?? parsed[emailLower].status,
          };
          localStorage.setItem('makepdf_local_users', JSON.stringify(parsed));
        }
      }
    } catch (e) {
      console.warn('Could not update local storage user record:', e);
    }

    // Sync to active session if currently logged in
    try {
      const currentRaw = localStorage.getItem('makepdf_current_user');
      if (currentRaw) {
        const cur = JSON.parse(currentRaw);
        if (cur.email?.toLowerCase() === emailLower) {
          if (updates.name) cur.name = updates.name;
          if (updates.role) cur.isAdmin = updates.role === 'admin';
          if (updates.filesProcessed !== undefined) cur.filesProcessed = updates.filesProcessed;
          localStorage.setItem('makepdf_current_user', JSON.stringify(cur));
        }
      }
    } catch {}

    saveAnalyticsData(data);
  }
  return data;
}

export function deleteTrackedUser(email: string): AnalyticsData {
  const data = getAnalyticsData();
  const emailLower = email.toLowerCase();

  // Prevent deleting Super Admin
  if (emailLower === ADMIN_CREDENTIALS.email.toLowerCase()) {
    return data;
  }

  data.users = data.users.filter((u) => u.email.toLowerCase() !== emailLower);

  // Remove from makepdf_local_users
  try {
    const rawLocal = localStorage.getItem('makepdf_local_users');
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      delete parsed[emailLower];
      localStorage.setItem('makepdf_local_users', JSON.stringify(parsed));
    }
  } catch (e) {
    console.warn('Could not delete local user record:', e);
  }

  data.uniqueLoggedInUsers = data.users.filter((u) => u.loginCount > 0 || u.status === 'active').length;
  saveAnalyticsData(data);
  return data;
}

export function addNewTrackedUser(userData: {
  name: string;
  email: string;
  role?: 'admin' | 'user';
  status?: 'active' | 'idle' | 'suspended';
  initialPassword?: string;
}): AnalyticsData {
  const data = getAnalyticsData();
  const cleanEmail = userData.email.trim().toLowerCase();
  const cleanName = userData.name.trim() || cleanEmail.split('@')[0];
  const role = userData.role || 'user';
  const status = userData.status || 'active';
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Save in local users so they can log in
  try {
    const rawLocal = localStorage.getItem('makepdf_local_users');
    const parsed = rawLocal ? JSON.parse(rawLocal) : {};
    parsed[cleanEmail] = {
      email: cleanEmail,
      name: cleanName,
      password: userData.initialPassword || 'Pass@123',
      role,
      status,
      createdAt: now.toISOString(),
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=0284c7&textColor=ffffff`,
    };
    localStorage.setItem('makepdf_local_users', JSON.stringify(parsed));
  } catch (e) {
    console.warn('Could not save new local user:', e);
  }

  const existingIdx = data.users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
  const newUser: TrackedUser = {
    email: cleanEmail,
    name: cleanName,
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=0284c7&textColor=ffffff`,
    role,
    loginCount: 0,
    lastLogin: 'Account Created by Admin',
    firstJoined: dateStr,
    status,
    filesProcessed: 0,
  };

  if (existingIdx >= 0) {
    data.users[existingIdx] = newUser;
  } else {
    data.users.unshift(newUser);
  }

  data.uniqueLoggedInUsers = data.users.filter((u) => u.loginCount > 0 || u.status === 'active').length;
  saveAnalyticsData(data);
  return data;
}

export function updateSiteCounters(updates: {
  totalVisits?: number;
  todayVisits?: number;
  totalLogins?: number;
}): AnalyticsData {
  const data = getAnalyticsData();
  if (updates.totalVisits !== undefined) data.totalVisits = Math.max(0, updates.totalVisits);
  if (updates.todayVisits !== undefined) data.todayVisits = Math.max(0, updates.todayVisits);
  if (updates.totalLogins !== undefined) data.totalLogins = Math.max(0, updates.totalLogins);
  saveAnalyticsData(data);
  return data;
}

export function syncRealDatabaseUsers(): AnalyticsData {
  return getAnalyticsData();
}

export function resetAnalyticsStore(): AnalyticsData {
  const initial: AnalyticsData = {
    totalVisits: 1, // Current active administrator session
    uniqueVisitors: 1,
    todayVisits: 1,
    totalLogins: 0,
    uniqueLoggedInUsers: 0,
    visitors: [],
    logins: [],
    users: getRealRegisteredUsers([]),
    pageViews: {
      Home: 1,
    },
    lastUpdated: new Date().toISOString(),
  };
  saveAnalyticsData(initial);
  return initial;
}
