import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Eye,
  LogIn,
  TrendingUp,
  Monitor,
  Smartphone,
  Globe,
  RefreshCw,
  Download,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Search,
  Filter,
  BarChart3,
  Layers,
  Sparkles,
  Zap,
  Database,
  Edit3,
  Trash2,
  UserPlus,
  X,
  SlidersHorizontal,
  Save,
  Check,
  ShieldCheck,
  Clock,
  FileText
} from 'lucide-react';
import { AnalyticsData, TrackedUser, UserState } from '../types';
import {
  ADMIN_CREDENTIALS,
  getAnalyticsData,
  verifyAdminCredentials,
  syncRealDatabaseUsers,
  syncFirestoreUsersIntoAnalytics,
  resetAnalyticsStore,
  updateTrackedUser,
  deleteTrackedUser,
  addNewTrackedUser,
  updateSiteCounters,
} from '../utils/analyticsStore';
import { fetchAllFirestoreUsers } from '../firebase';

interface AdminPanelProps {
  currentUser: UserState;
  onNavigateHome: () => void;
  onAdminLoginSuccess?: (adminEmail: string) => void;
  onOpenFirebaseConfig?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  onNavigateHome,
  onAdminLoginSuccess,
  onOpenFirebaseConfig,
}) => {
  // Check if current user is already authenticated as admin
  const isCurrentlyAdmin =
    currentUser.isLoggedIn &&
    currentUser.email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(isCurrentlyAdmin);
  const [adminEmailInput, setAdminEmailInput] = useState<string>('pankajgadhari154@gmail.com');
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Analytics data state
  const [analytics, setAnalytics] = useState<AnalyticsData>(getAnalyticsData());
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'visitors' | 'logins'>('overview');
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'idle' | 'suspended'>('all');
  const [visitorFilterPage, setVisitorFilterPage] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Editing Modals State
  const [editingUser, setEditingUser] = useState<TrackedUser | null>(null);
  const [editUserName, setEditUserName] = useState<string>('');
  const [editUserRole, setEditUserRole] = useState<'admin' | 'user'>('user');
  const [editUserStatus, setEditUserStatus] = useState<'active' | 'idle' | 'suspended'>('active');
  const [editUserFiles, setEditUserFiles] = useState<number>(0);

  // Add New User Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserPassword, setNewUserPassword] = useState<string>('Pass@123');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>('user');
  const [newUserStatus, setNewUserStatus] = useState<'active' | 'idle' | 'suspended'>('active');

  // Edit Counters Modal State
  const [isEditCountersModalOpen, setIsEditCountersModalOpen] = useState<boolean>(false);
  const [editTotalVisits, setEditTotalVisits] = useState<number>(0);
  const [editTodayVisits, setEditTodayVisits] = useState<number>(0);
  const [editTotalLogins, setEditTotalLogins] = useState<number>(0);

  // Auto reload analytics when component mounts or refreshed
  useEffect(() => {
    const loadRealData = async () => {
      const data = getAnalyticsData();
      try {
        const firestoreUsers = await fetchAllFirestoreUsers();
        if (firestoreUsers && firestoreUsers.length > 0) {
          const merged = syncFirestoreUsersIntoAnalytics(firestoreUsers);
          setAnalytics({ ...merged });
          return;
        }
      } catch (e) {
        console.warn('Could not fetch Firestore users on mount:', e);
      }
      setAnalytics(data);
    };
    loadRealData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (verifyAdminCredentials(adminEmailInput, adminPasswordInput)) {
      setIsAuthenticated(true);
      if (onAdminLoginSuccess) {
        onAdminLoginSuccess(ADMIN_CREDENTIALS.email);
      }
      showToast('Welcome Super Admin Pankaj! Access Granted.');
    } else {
      setLoginError('Invalid Admin credentials. Use pankajgadhari154@gmail.com and Pass@123');
    }
  };

  const handleQuickAdminLogin = () => {
    setAdminEmailInput('pankajgadhari154@gmail.com');
    setAdminPasswordInput('Pass@123');
    setIsAuthenticated(true);
    if (onAdminLoginSuccess) {
      onAdminLoginSuccess(ADMIN_CREDENTIALS.email);
    }
    showToast('Super Admin auto-authenticated with Pass@123');
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const firestoreUsers = await fetchAllFirestoreUsers();
      if (firestoreUsers && firestoreUsers.length > 0) {
        syncFirestoreUsersIntoAnalytics(firestoreUsers);
      }
    } catch {}
    const data = getAnalyticsData();
    setAnalytics({ ...data });
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Live analytics refreshed from Firestore and browser sessions.');
    }, 300);
  };

  const handleSyncUsers = async () => {
    setIsRefreshing(true);
    try {
      const firestoreUsers = await fetchAllFirestoreUsers();
      if (firestoreUsers && firestoreUsers.length > 0) {
        const merged = syncFirestoreUsersIntoAnalytics(firestoreUsers);
        setAnalytics({ ...merged });
        showToast(`Synced ${firestoreUsers.length} real accounts from Firestore!`);
      } else {
        const updated = syncRealDatabaseUsers();
        setAnalytics({ ...updated });
        showToast('Synced real registered accounts from database & storage.');
      }
    } catch {
      const updated = syncRealDatabaseUsers();
      setAnalytics({ ...updated });
      showToast('Synced real registered accounts from database & storage.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset analytics counters and start fresh tracking with clean baseline?')) {
      const reset = resetAnalyticsStore();
      setAnalytics({ ...reset });
      showToast('Analytics counters reset to clean real baseline.');
    }
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(analytics, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `makepdf_analytics_report_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Analytics report exported as JSON!');
  };

  // Open Edit User Modal
  const handleOpenEditUser = (u: TrackedUser) => {
    setEditingUser(u);
    setEditUserName(u.name);
    setEditUserRole(u.role);
    setEditUserStatus(u.status || 'active');
    setEditUserFiles(u.filesProcessed || 0);
  };

  // Save Edit User
  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updated = updateTrackedUser(editingUser.email, {
      name: editUserName.trim() || editingUser.email.split('@')[0],
      role: editUserRole,
      status: editUserStatus,
      filesProcessed: Number(editUserFiles) || 0,
    });

    setAnalytics({ ...updated });
    setEditingUser(null);
    showToast(`User ${editingUser.email} updated successfully!`);
  };

  // Delete User
  const handleDeleteUser = (u: TrackedUser) => {
    if (u.email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase()) {
      showToast('Cannot delete the primary Super Admin account.');
      return;
    }

    if (window.confirm(`Are you sure you want to remove user "${u.name}" (${u.email})?`)) {
      const updated = deleteTrackedUser(u.email);
      setAnalytics({ ...updated });
      showToast(`User ${u.email} deleted successfully.`);
    }
  };

  // Add New User Submit
  const handleAddNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim()) {
      showToast('Please enter a valid email address.');
      return;
    }

    const updated = addNewTrackedUser({
      name: newUserName.trim() || newUserEmail.split('@')[0],
      email: newUserEmail.trim(),
      initialPassword: newUserPassword || 'Pass@123',
      role: newUserRole,
      status: newUserStatus,
    });

    setAnalytics({ ...updated });
    setIsAddUserModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('Pass@123');
    showToast(`New user "${newUserEmail}" created successfully!`);
  };

  // Open Counters Modal
  const handleOpenCountersModal = () => {
    setEditTotalVisits(analytics.totalVisits);
    setEditTodayVisits(analytics.todayVisits);
    setEditTotalLogins(analytics.totalLogins);
    setIsEditCountersModalOpen(true);
  };

  // Save Counters Modal
  const handleSaveCounters = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateSiteCounters({
      totalVisits: Number(editTotalVisits),
      todayVisits: Number(editTodayVisits),
      totalLogins: Number(editTotalLogins),
    });
    setAnalytics({ ...updated });
    setIsEditCountersModalOpen(false);
    showToast('Analytics metric counters updated successfully!');
  };

  // Filtered users
  const filteredUsers = analytics.users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesStatus = userStatusFilter === 'all' || u.status === userStatusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Filtered visitors
  const filteredVisitors = analytics.visitors.filter((v) => {
    if (visitorFilterPage === 'all') return true;
    return v.page.toLowerCase().includes(visitorFilterPage.toLowerCase());
  });

  // Calculate conversion rate
  const conversionRate = analytics.totalVisits > 0
    ? ((analytics.totalLogins / analytics.totalVisits) * 100).toFixed(1)
    : '0';

  // Calculate real device breakdown from actual tracked visitors
  const totalVisitorsTracked = analytics.visitors.length;
  const pcVisitors = analytics.visitors.filter((v) =>
    v.device.includes('Laptop') || v.device.includes('PC') || v.device.includes('Desktop') || v.device.includes('Mac') || v.device.includes('Windows')
  ).length;
  const mobVisitors = analytics.visitors.filter((v) =>
    v.device.includes('Mobile') || v.device.includes('Android') || v.device.includes('iOS')
  ).length;
  const tabVisitors = analytics.visitors.filter((v) =>
    v.device.includes('Tablet') || v.device.includes('iPad')
  ).length;

  const pcPercent = totalVisitorsTracked > 0 ? Math.round((pcVisitors / totalVisitorsTracked) * 100) : 0;
  const mobPercent = totalVisitorsTracked > 0 ? Math.round((mobVisitors / totalVisitorsTracked) * 100) : 0;
  const tabPercent = totalVisitorsTracked > 0 ? Math.max(0, 100 - pcPercent - mobPercent) : 0;

  // LOGIN GATE SCREEN IF NOT AUTHENTICATED
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07070a] text-white flex flex-col justify-center items-center px-4 py-8 sm:py-12 relative overflow-hidden">
        {/* Glowing backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-[#ff5722]/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="mb-4 sm:mb-6 flex justify-between items-center gap-2">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer py-1.5 px-3 rounded-lg bg-[#14141d] border border-[#232332]"
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              <span>Back to Home</span>
            </button>
            <span className="text-[10px] sm:text-[11px] font-mono text-[#ff851a] uppercase bg-[#ff5722]/10 px-2.5 py-1 rounded-full border border-[#ff5722]/20 flex items-center gap-1.5 shrink-0">
              <Lock className="w-3 h-3" />
              RESTRICTED ACCESS
            </span>
          </div>

          <div className="rounded-2xl bg-[#0f0f16] border border-[#242436] p-6 sm:p-8 shadow-2xl shadow-black/80">
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[#1c1c2a]">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff5722] to-[#ea580c] flex items-center justify-center shadow-lg shadow-[#ff5722]/20 shrink-0">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-white font-display truncate">Super Admin Portal</h1>
                <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                  Sign in to inspect visitor logs, user records, and application telemetry
                </p>
              </div>
            </div>

            {loginError && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="leading-snug">{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Admin Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={adminEmailInput}
                    onChange={(e) => setAdminEmailInput(e.target.value)}
                    placeholder="pankajgadhari154@gmail.com"
                    required
                    className="w-full bg-[#08080c] border border-[#29293e] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff5722]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Admin Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="Pass@123"
                    required
                    className="w-full bg-[#08080c] border border-[#29293e] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff5722]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-xs text-black bg-gradient-to-r from-[#ff851a] to-[#ff5500] hover:from-[#ff9933] hover:to-[#ff661a] shadow-[0_0_20px_rgba(255,107,0,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Authorize & Enter Admin Panel</span>
              </button>
            </form>

            {/* Quick 1-click preset button */}
            <div className="mt-5 pt-4 border-t border-[#1c1c2a]">
              <div className="p-3 rounded-xl bg-[#141420] border border-[#262638] text-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1 text-neutral-400">
                  <span className="shrink-0">Assigned Admin:</span>
                  <span className="font-mono text-[#ff851a] font-semibold break-all">pankajgadhari154@gmail.com</span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Assigned Password:</span>
                  <span className="font-mono text-emerald-400 font-semibold">Pass@123</span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickAdminLogin}
                  className="w-full mt-2 py-2 px-3 rounded-lg bg-[#ff5722]/15 hover:bg-[#ff5722]/25 border border-[#ff5722]/30 text-xs font-semibold text-[#ff851a] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1-Click Super Admin Login</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-[#07070a] text-white flex flex-col pb-16">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 bg-[#151522] border border-[#ff5722] text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 max-w-[90vw]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* Top Admin Sticky Navigation Bar - Designed for ZERO text overlap */}
      <header className="sticky top-0 z-40 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-[#1c1c2a]">
        <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          {/* Left Brand & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              onClick={onNavigateHome}
              className="p-2 rounded-xl bg-[#14141e] hover:bg-[#1f1f2c] border border-[#272738] text-neutral-300 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Return to MAKEPDF Main App"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#ff5722] to-[#ea580c] flex items-center justify-center shadow-md shrink-0">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight shrink-0">
                  Admin Control Center
                </h1>
                <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE TELEMETRY
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 font-mono truncate mt-0.5">
                Administrator: <span className="text-[#ff851a] font-semibold">pankajgadhari154@gmail.com</span>
              </p>
            </div>
          </div>

          {/* Right Action Tools - Flex wrapped with clean spacing */}
          <div className="flex items-center gap-2 flex-wrap">
            {onOpenFirebaseConfig && (
              <button
                onClick={onOpenFirebaseConfig}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#ff5722]/15 hover:bg-[#ff5722]/25 border border-[#ff5722]/40 text-xs font-semibold text-[#ff851a] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                title="Configure Firebase"
              >
                <Database className="w-3.5 h-3.5 text-[#ff851a] shrink-0" />
                <span className="hidden sm:inline">Firebase Config</span>
                <span className="sm:hidden">Firebase</span>
              </button>
            )}

            <button
              onClick={handleSyncUsers}
              disabled={isRefreshing}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#151522] hover:bg-[#1f1f30] border border-[#2c2c40] text-xs font-semibold text-neutral-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Sync real registered users from Firestore and storage"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Sync Users</span>
            </button>

            <button
              onClick={handleOpenCountersModal}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#151522] hover:bg-[#1f1f30] border border-[#2c2c40] text-xs font-semibold text-amber-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Edit Metric Counters"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Edit Stats</span>
            </button>

            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="p-1.5 sm:p-2 rounded-lg bg-[#151522] hover:bg-[#1f1f30] border border-[#2c2c40] text-neutral-300 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#ff5722]' : ''}`} />
            </button>

            <button
              onClick={handleExportData}
              className="p-1.5 sm:p-2 rounded-lg bg-[#151522] hover:bg-[#1f1f30] border border-[#2c2c40] text-neutral-300 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Export Report JSON"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onNavigateHome}
              className="px-3 py-1.5 rounded-lg bg-[#ff5722] hover:bg-[#ff6633] text-black font-bold text-xs transition-colors cursor-pointer shrink-0"
            >
              Main App
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12 pt-6 flex-1 space-y-6">
        {/* KPI OVERVIEW CARDS - Formatted with no overlapping text */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {/* 1. Website Visits Card */}
          <div className="relative overflow-hidden rounded-2xl bg-[#0f0f16] border border-[#232334] p-4 sm:p-5 shadow-lg group hover:border-[#ff5722]/50 transition-all flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff5722]/5 rounded-bl-full pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-xs font-semibold text-neutral-400 tracking-wide uppercase font-mono truncate">
                  Website Visits
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#ff5722]/15 border border-[#ff5722]/30 flex items-center justify-center text-[#ff851a] shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                  {analytics.totalVisits.toLocaleString()}
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5 shrink-0">
                  <TrendingUp className="w-3 h-3" />
                  +{analytics.todayVisits} today
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#1a1a28] flex items-center justify-between gap-2 text-xs text-neutral-400">
              <span className="shrink-0">Unique Visitors:</span>
              <span className="text-white font-mono font-semibold truncate">{analytics.uniqueVisitors}</span>
            </div>
          </div>

          {/* 2. User Logins Card */}
          <div className="relative overflow-hidden rounded-2xl bg-[#0f0f16] border border-[#232334] p-4 sm:p-5 shadow-lg group hover:border-emerald-500/50 transition-all flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-xs font-semibold text-neutral-400 tracking-wide uppercase font-mono truncate">
                  Users Logged In
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <LogIn className="w-4 h-4" />
                </div>
              </div>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                  {analytics.totalLogins.toLocaleString()}
                </span>
                <span className="text-xs text-emerald-400 font-semibold shrink-0">
                  auth events
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#1a1a28] flex items-center justify-between gap-2 text-xs text-neutral-400">
              <span className="shrink-0">Unique Logins:</span>
              <span className="text-emerald-400 font-mono font-semibold truncate">{analytics.uniqueLoggedInUsers} accounts</span>
            </div>
          </div>

          {/* 3. Login Conversion Rate */}
          <div className="relative overflow-hidden rounded-2xl bg-[#0f0f16] border border-[#232334] p-4 sm:p-5 shadow-lg group hover:border-blue-500/50 transition-all flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-xs font-semibold text-neutral-400 tracking-wide uppercase font-mono truncate">
                  Conversion Rate
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                  {conversionRate}%
                </span>
                <span className="text-xs text-neutral-400 shrink-0">
                  visitor-to-auth
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#1a1a28] flex items-center justify-between gap-2 text-xs text-neutral-400">
              <span className="shrink-0">Active Accounts:</span>
              <span className="text-blue-400 font-mono font-semibold truncate">
                {analytics.users.filter((u) => u.status === 'active').length} active
              </span>
            </div>
          </div>

          {/* 4. Super Admin Privilege Card */}
          <div className="relative overflow-hidden rounded-2xl bg-[#0f0f16] border border-[#232334] p-4 sm:p-5 shadow-lg group hover:border-purple-500/50 transition-all flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-xs font-semibold text-neutral-400 tracking-wide uppercase font-mono truncate">
                  Admin Privilege
                </span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-base sm:text-lg font-bold text-white font-mono truncate">
                  Super Admin
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                pankajgadhari154@gmail.com
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-[#1a1a28] flex items-center justify-between gap-2 text-xs text-neutral-400">
              <span className="shrink-0">Security Status:</span>
              <span className="text-emerald-400 font-mono font-semibold flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Scrollable on mobile to PREVENT ANY TEXT OVERLAPPING */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1f1f2e] pb-1 gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 pt-0.5 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-[#ff5722] text-black shadow-md shadow-[#ff5722]/20'
                  : 'bg-[#12121a] text-neutral-400 hover:text-white border border-[#20202e]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 shrink-0" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap ${
                activeTab === 'users'
                  ? 'bg-[#ff5722] text-black shadow-md shadow-[#ff5722]/20'
                  : 'bg-[#12121a] text-neutral-400 hover:text-white border border-[#20202e]'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>Users ({analytics.users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('visitors')}
              className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap ${
                activeTab === 'visitors'
                  ? 'bg-[#ff5722] text-black shadow-md shadow-[#ff5722]/20'
                  : 'bg-[#12121a] text-neutral-400 hover:text-white border border-[#20202e]'
              }`}
            >
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span>Visitors Feed ({analytics.visitors.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('logins')}
              className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap ${
                activeTab === 'logins'
                  ? 'bg-[#ff5722] text-black shadow-md shadow-[#ff5722]/20'
                  : 'bg-[#12121a] text-neutral-400 hover:text-white border border-[#20202e]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" />
              <span>Login Stream ({analytics.logins.length})</span>
            </button>
          </div>

          <div className="text-[11px] text-neutral-500 font-mono shrink-0 self-end sm:self-center">
            Synced: {new Date(analytics.lastUpdated).toLocaleTimeString()}
          </div>
        </div>

        {/* TAB 1: OVERVIEW & BREAKDOWN CHARTS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Popular Visited Pages */}
              <div className="rounded-2xl bg-[#0f0f16] border border-[#222232] p-4 sm:p-5 shadow-lg lg:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-[#1b1b28]">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#ff5722] shrink-0" />
                      <span>Most Visited Tools & Pages</span>
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Breakdown of page hits across MAKEPDF tools
                    </p>
                  </div>
                  <span className="text-xs font-mono text-neutral-400 shrink-0">
                    Total Visits: <strong className="text-white">{analytics.totalVisits}</strong>
                  </span>
                </div>

                <div className="space-y-3.5">
                  {Object.entries(analytics.pageViews)
                    .sort(([, a], [, b]) => b - a)
                    .map(([page, count]) => {
                      const percentage = Math.round((count / (analytics.totalVisits || 1)) * 100);
                      return (
                        <div key={page} className="space-y-1">
                          <div className="flex items-center justify-between text-xs gap-2">
                            <span className="font-medium text-neutral-200 truncate">{page}</span>
                            <span className="font-mono text-neutral-400 shrink-0">
                              <strong className="text-white">{count}</strong> views ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[#171724] overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#ff5722] to-[#ea580c] rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.max(6, percentage))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Device and Traffic Split */}
              <div className="rounded-2xl bg-[#0f0f16] border border-[#222232] p-4 sm:p-5 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1b1b28]">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Device Demographics</span>
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-[#14141f] border border-[#222232] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                          <Monitor className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">Laptop & PC</p>
                          <p className="text-[10px] text-neutral-400 truncate">Mac, Windows, Linux</p>
                        </div>
                      </div>
                      <span className="text-sm font-mono font-bold text-cyan-400 shrink-0">{pcPercent}%</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#14141f] border border-[#222232] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">Mobile Devices</p>
                          <p className="text-[10px] text-neutral-400 truncate">Android, iPhones</p>
                        </div>
                      </div>
                      <span className="text-sm font-mono font-bold text-purple-400 shrink-0">{mobPercent}%</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#14141f] border border-[#222232] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">Tablets & Others</p>
                          <p className="text-[10px] text-neutral-400 truncate">iPad, Tablets</p>
                        </div>
                      </div>
                      <span className="text-sm font-mono font-bold text-amber-400 shrink-0">{tabPercent}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-[#ff5722]/10 border border-[#ff5722]/20 text-[11px] text-neutral-300">
                  <p className="font-semibold text-[#ff851a] mb-0.5">Responsive Layout Notice</p>
                  Optimized for mobile phones, tablets, and full-width desktop monitors up to 1600px.
                </div>
              </div>
            </div>

            {/* Quick Summary Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
              <div className="p-4 rounded-xl bg-[#0f0f16] border border-[#202030] flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">Persistent Storage</p>
                  <p className="text-[11px] text-neutral-400 leading-snug">Visits & logins stay stored across browser restarts</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0f0f16] border border-[#202030] flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#ff5722]/10 text-[#ff851a] flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">Protected Super Admin</p>
                  <p className="text-[11px] text-neutral-400 font-mono truncate">pankajgadhari154@gmail.com</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0f0f16] border border-[#202030] flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">Real-Time Telemetry</p>
                  <p className="text-[11px] text-neutral-400 leading-snug">Tool usage and user authorizations log instantaneously</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LOGGED-IN USERS DIRECTORY WITH FULL EDITING CAPABILITIES */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[#0f0f16] border border-[#222232] p-4 rounded-2xl">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>User Directory & Management</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  View, edit, promote, or manage user accounts
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search Bar */}
                <div className="relative flex-1 sm:w-64 min-w-[200px]">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search name or email..."
                    className="w-full bg-[#151522] border border-[#2a2a3e] rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff5722]"
                  />
                  {userSearchQuery && (
                    <button
                      onClick={() => setUserSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Role Filter */}
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value as any)}
                  className="bg-[#151522] border border-[#2a2a3e] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#ff5722]"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins</option>
                  <option value="user">Users</option>
                </select>

                {/* Status Filter */}
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value as any)}
                  className="bg-[#151522] border border-[#2a2a3e] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#ff5722]"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="idle">Idle</option>
                  <option value="suspended">Suspended</option>
                </select>

                {/* Add New User Button */}
                <button
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#ff851a] to-[#ff5500] hover:from-[#ff9933] hover:to-[#ff661a] text-black font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-[#ff5722]/20 shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add User</span>
                </button>
              </div>
            </div>

            {/* Mobile View: Cards (avoids table squashing on narrow phones) */}
            <div className="block lg:hidden space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="rounded-2xl bg-[#0f0f16] border border-[#222232] p-8 text-center text-neutral-500 text-xs">
                  No users matched the criteria.
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isSuperAdmin = u.email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase();
                  return (
                    <div
                      key={u.email}
                      className="rounded-2xl bg-[#0f0f16] border border-[#222232] p-4 space-y-3 shadow-md hover:border-[#ff5722]/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={u.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`}
                            alt={u.name}
                            className="w-10 h-10 rounded-full border border-[#ff5722]/50 bg-[#1a1a26] shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-white text-sm truncate">{u.name}</span>
                              {isSuperAdmin && (
                                <span className="text-[9px] bg-[#ff5722]/20 border border-[#ff5722]/40 text-[#ff851a] px-1.5 py-0.5 rounded font-mono font-bold shrink-0">
                                  SUPER ADMIN
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-400 font-mono truncate">{u.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleOpenEditUser(u)}
                            className="p-1.5 rounded-lg bg-[#181826] hover:bg-[#ff5722]/20 border border-[#2a2a3e] text-neutral-300 hover:text-[#ff851a] transition-colors"
                            title="Edit User"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {!isSuperAdmin && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 rounded-lg bg-[#181826] hover:bg-red-500/20 border border-[#2a2a3e] text-neutral-300 hover:text-red-400 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-[#1b1b28]">
                        <div>
                          <span className="text-neutral-500 block">Role:</span>
                          <span className="font-semibold text-neutral-200 uppercase text-[10px]">
                            {u.role}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block">Status:</span>
                          <span className={`inline-flex items-center gap-1 font-semibold text-[10px] ${
                            u.status === 'active' ? 'text-emerald-400' : u.status === 'suspended' ? 'text-red-400' : 'text-neutral-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'active' ? 'bg-emerald-400' : u.status === 'suspended' ? 'bg-red-400' : 'bg-neutral-500'
                            }`} />
                            {u.status || 'Active'}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block">Logins:</span>
                          <span className="font-mono text-white font-medium">{u.loginCount} times</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block">PDFs Processed:</span>
                          <span className="font-mono text-white font-medium">{u.filesProcessed || 0} files</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-neutral-500 block">Last Active:</span>
                          <span className="font-mono text-neutral-300 text-[10px]">{u.lastLogin}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop View: Full Table with HORIZONTAL SCROLL & NO WORD OVERLAP */}
            <div className="hidden lg:block rounded-2xl bg-[#0f0f16] border border-[#222232] overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[880px]">
                  <thead className="bg-[#141420] border-b border-[#222232] text-neutral-400 uppercase font-mono text-[11px]">
                    <tr>
                      <th className="px-5 py-3.5 whitespace-nowrap min-w-[240px]">User Account</th>
                      <th className="px-5 py-3.5 whitespace-nowrap min-w-[120px]">Role</th>
                      <th className="px-5 py-3.5 whitespace-nowrap min-w-[100px] text-center">Logins</th>
                      <th className="px-5 py-3.5 whitespace-nowrap min-w-[140px]">Last Active</th>
                      <th className="px-5 py-3.5 whitespace-nowrap min-w-[120px]">First Joined</th>
                      <th className="px-5 py-3.5 whitespace-nowrap min-w-[100px]">PDFs Made</th>
                      <th className="px-5 py-3.5 whitespace-nowrap min-w-[100px]">Status</th>
                      <th className="px-5 py-3.5 whitespace-nowrap min-w-[100px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1b1b29]">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-8 text-center text-neutral-500">
                          No users matched "{userSearchQuery}"
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isSuperAdmin = u.email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase();
                        return (
                          <tr key={u.email} className="hover:bg-[#151522] transition-colors">
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <img
                                  src={u.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`}
                                  alt={u.name}
                                  className="w-8 h-8 rounded-full border border-[#ff5722]/50 bg-[#1a1a26] shrink-0"
                                />
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-white">{u.name}</span>
                                    {isSuperAdmin && (
                                      <span className="text-[10px] bg-[#ff5722]/20 border border-[#ff5722]/40 text-[#ff851a] px-1.5 py-0.2 rounded font-mono shrink-0">
                                        YOU
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-neutral-400 font-mono">{u.email}</p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-3.5 whitespace-nowrap">
                              {u.role === 'admin' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-[#ff5722]/15 text-[#ff851a] border border-[#ff5722]/30">
                                  <ShieldAlert className="w-3 h-3" />
                                  Admin
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase bg-neutral-800 text-neutral-300 border border-neutral-700">
                                  User
                                </span>
                              )}
                            </td>

                            <td className="px-5 py-3.5 whitespace-nowrap text-center font-mono font-bold text-white">
                              <span className="px-2 py-0.5 rounded-md bg-[#191928] border border-[#2b2b40]">
                                {u.loginCount}
                              </span>
                            </td>

                            <td className="px-5 py-3.5 whitespace-nowrap text-neutral-300 font-mono text-[11px]">
                              {u.lastLogin}
                            </td>

                            <td className="px-5 py-3.5 whitespace-nowrap text-neutral-400 text-[11px]">
                              {u.firstJoined}
                            </td>

                            <td className="px-5 py-3.5 whitespace-nowrap text-neutral-300 font-mono">
                              {u.filesProcessed || 0} PDFs
                            </td>

                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                                u.status === 'active' ? 'text-emerald-400' : u.status === 'suspended' ? 'text-red-400' : 'text-neutral-400'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  u.status === 'active' ? 'bg-emerald-400' : u.status === 'suspended' ? 'bg-red-400' : 'bg-neutral-500'
                                }`} />
                                {u.status === 'active' ? 'Active' : u.status === 'suspended' ? 'Suspended' : 'Idle'}
                              </span>
                            </td>

                            <td className="px-5 py-3.5 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditUser(u)}
                                  className="p-1.5 rounded-lg bg-[#1c1c2a] hover:bg-[#ff5722]/20 border border-[#2c2c3e] text-neutral-300 hover:text-[#ff851a] transition-colors"
                                  title="Edit User"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                {!isSuperAdmin && (
                                  <button
                                    onClick={() => handleDeleteUser(u)}
                                    className="p-1.5 rounded-lg bg-[#1c1c2a] hover:bg-red-500/20 border border-[#2c2c3e] text-neutral-300 hover:text-red-400 transition-colors"
                                    title="Delete User"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WEBSITE VISITORS FEED */}
        {activeTab === 'visitors' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0f0f16] border border-[#222232] p-4 rounded-2xl">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#ff5722] shrink-0" />
                  <span>Real-Time Website Visitors Audit Log</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Live visitor sessions and pages accessed on MAKEPDF
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-neutral-500 shrink-0" />
                <select
                  value={visitorFilterPage}
                  onChange={(e) => setVisitorFilterPage(e.target.value)}
                  className="bg-[#151522] border border-[#2a2a3e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff5722]"
                >
                  <option value="all">All Pages ({analytics.visitors.length})</option>
                  <option value="Home">Home Only</option>
                  <option value="JPG to PDF">JPG to PDF</option>
                  <option value="Merge PDF">Merge PDF</option>
                  <option value="Compress PDF">Compress PDF</option>
                  <option value="Dashboard">Dashboard</option>
                </select>
              </div>
            </div>

            <div className="rounded-2xl bg-[#0f0f16] border border-[#222232] overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[760px]">
                  <thead className="bg-[#141420] border-b border-[#222232] text-neutral-400 uppercase font-mono text-[11px]">
                    <tr>
                      <th className="px-5 py-3.5 whitespace-nowrap min-w-[180px]">Visitor Session ID</th>
                      <th className="px-5 py-3.5 whitespace-nowrap min-w-[130px]">Visited Page</th>
                      <th className="px-5 py-3.5 whitespace-nowrap min-w-[150px]">Device & Platform</th>
                      <th className="px-5 py-3.5 whitespace-nowrap min-w-[110px]">Browser</th>
                      <th className="px-5 py-3.5 whitespace-nowrap min-w-[110px]">Source</th>
                      <th className="px-5 py-3.5 whitespace-nowrap min-w-[140px] text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1b1b29]">
                    {filteredVisitors.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-neutral-500 font-mono text-xs">
                          No visitor sessions recorded yet. Real visits will log live here as users browse.
                        </td>
                      </tr>
                    ) : (
                      filteredVisitors.map((vis) => (
                        <tr key={vis.id} className="hover:bg-[#151522] transition-colors">
                          <td className="px-5 py-3.5 whitespace-nowrap font-mono text-[11px] text-neutral-300">
                            <span className="text-[#ff851a] font-bold">{vis.visitorId}</span>
                            {vis.isUniqueToday && (
                              <span className="ml-2 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                                Unique
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-md bg-[#181826] border border-[#26263a] text-white font-medium">
                              {vis.page}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 whitespace-nowrap text-neutral-300">
                            {vis.device}
                          </td>

                          <td className="px-5 py-3.5 whitespace-nowrap text-neutral-400 font-mono text-[11px]">
                            {vis.browser}
                          </td>

                          <td className="px-5 py-3.5 whitespace-nowrap text-neutral-400">
                            {vis.referrer}
                          </td>

                          <td className="px-5 py-3.5 whitespace-nowrap text-right font-mono text-[11px] text-neutral-400">
                            {vis.timestamp}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LOGIN ACTIVITY LOG */}
        {activeTab === 'logins' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0f0f16] border border-[#222232] p-4 rounded-2xl">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <LogIn className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Real-Time Authentication Audit Stream</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Detailed timeline of sign-in events and user authorizations
                </p>
              </div>

              <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg shrink-0">
                Total Sign-Ins Logged: {analytics.logins.length}
              </div>
            </div>

            <div className="rounded-2xl bg-[#0f0f16] border border-[#222232] overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[780px]">
                  <thead className="bg-[#141420] border-b border-[#222232] text-neutral-400 uppercase font-mono text-[11px]">
                    <tr>
                      <th className="px-5 py-3.5 whitespace-nowrap min-w-[140px]">Timestamp</th>
                      <th className="px-5 py-3.5 whitespace-nowrap min-w-[220px]">Account / Email</th>
                      <th className="px-5 py-3.5 whitespace-nowrap min-w-[100px]">Role</th>
                      <th className="px-5 py-3.5 whitespace-nowrap min-w-[140px]">Auth Method</th>
                      <th className="px-5 py-3.5 whitespace-nowrap min-w-[130px]">Device</th>
                      <th className="px-5 py-3.5 whitespace-nowrap min-w-[90px] text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1b1b29]">
                    {analytics.logins.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-neutral-500 font-mono text-xs">
                          No sign-in events recorded yet. Real user authentications will stream live here.
                        </td>
                      </tr>
                    ) : (
                      analytics.logins.map((lg) => {
                        const isSuperAdmin = lg.email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase();
                        return (
                          <tr key={lg.id} className="hover:bg-[#151522] transition-colors">
                            <td className="px-5 py-3.5 whitespace-nowrap font-mono text-[11px] text-neutral-400">
                              {lg.timestamp}
                            </td>

                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <div>
                                <span className="font-bold text-white block">{lg.name}</span>
                                <span className="text-neutral-400 font-mono text-[11px]">{lg.email}</span>
                              </div>
                            </td>

                            <td className="px-5 py-3.5 whitespace-nowrap">
                              {isSuperAdmin ? (
                                <span className="text-[10px] font-bold uppercase text-[#ff851a] bg-[#ff5722]/15 px-2 py-0.5 rounded border border-[#ff5722]/30">
                                  Super Admin
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium uppercase text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
                                  User
                                </span>
                              )}
                            </td>

                            <td className="px-5 py-3.5 whitespace-nowrap text-neutral-300">
                              {lg.method}
                            </td>

                            <td className="px-5 py-3.5 whitespace-nowrap text-neutral-400 font-mono text-[11px]">
                              {lg.device}
                            </td>

                            <td className="px-5 py-3.5 whitespace-nowrap text-right">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Success
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Danger / Management Bar */}
        <div className="pt-6 border-t border-[#1c1c2a] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>Admin Data Storage:</span>
            <span className="text-neutral-300 font-mono font-semibold">Live Firebase Firestore + Browser Session Telemetry</span>
          </div>
          <button
            onClick={handleResetData}
            className="text-red-400/80 hover:text-red-300 underline cursor-pointer transition-colors"
          >
            Reset Metrics to Baseline Default (Zero State)
          </button>
        </div>
      </main>

      {/* MODAL 1: EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f0f16] border border-[#29293e] rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg bg-[#181824]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#1f1f2e]">
              <div className="w-10 h-10 rounded-xl bg-[#ff5722]/15 text-[#ff851a] flex items-center justify-center">
                <Edit3 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white truncate">Edit User Account</h3>
                <p className="text-xs text-neutral-400 font-mono truncate">{editingUser.email}</p>
              </div>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Display Name</label>
                <input
                  type="text"
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  className="w-full bg-[#151522] border border-[#2a2a3e] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#ff5722]"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Account Role</label>
                <select
                  value={editUserRole}
                  onChange={(e) => setEditUserRole(e.target.value as any)}
                  className="w-full bg-[#151522] border border-[#2a2a3e] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#ff5722]"
                >
                  <option value="user">Standard User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Account Status</label>
                <select
                  value={editUserStatus}
                  onChange={(e) => setEditUserStatus(e.target.value as any)}
                  className="w-full bg-[#151522] border border-[#2a2a3e] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#ff5722]"
                >
                  <option value="active">Active</option>
                  <option value="idle">Idle</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">PDFs Created / Processed</label>
                <input
                  type="number"
                  min="0"
                  value={editUserFiles}
                  onChange={(e) => setEditUserFiles(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#151522] border border-[#2a2a3e] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#ff5722]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#1f1f2e]">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-[#181824] hover:bg-[#202030] text-neutral-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff851a] to-[#ff5500] hover:from-[#ff9933] hover:to-[#ff661a] text-black font-bold flex items-center gap-1.5 shadow-lg shadow-[#ff5722]/20"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW USER MODAL */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f0f16] border border-[#29293e] rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsAddUserModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg bg-[#181824]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#1f1f2e]">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Add New User</h3>
                <p className="text-xs text-neutral-400">Create an authorized account in the directory</p>
              </div>
            </div>

            <form onSubmit={handleAddNewUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-[#151522] border border-[#2a2a3e] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#ff5722]"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Email Address *</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  className="w-full bg-[#151522] border border-[#2a2a3e] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#ff5722]"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Initial Password</label>
                <input
                  type="text"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Pass@123"
                  className="w-full bg-[#151522] border border-[#2a2a3e] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#ff5722]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full bg-[#151522] border border-[#2a2a3e] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#ff5722]"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Status</label>
                  <select
                    value={newUserStatus}
                    onChange={(e) => setNewUserStatus(e.target.value as any)}
                    className="w-full bg-[#151522] border border-[#2a2a3e] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#ff5722]"
                  >
                    <option value="active">Active</option>
                    <option value="idle">Idle</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#1f1f2e]">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#181824] hover:bg-[#202030] text-neutral-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT METRIC COUNTERS MODAL */}
      {isEditCountersModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f0f16] border border-[#29293e] rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsEditCountersModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg bg-[#181824]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#1f1f2e]">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Adjust Metric Counters</h3>
                <p className="text-xs text-neutral-400">Directly edit site visits and login totals</p>
              </div>
            </div>

            <form onSubmit={handleSaveCounters} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Total Website Visits</label>
                <input
                  type="number"
                  min="0"
                  value={editTotalVisits}
                  onChange={(e) => setEditTotalVisits(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#151522] border border-[#2a2a3e] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#ff5722]"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Visits Today</label>
                <input
                  type="number"
                  min="0"
                  value={editTodayVisits}
                  onChange={(e) => setEditTodayVisits(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#151522] border border-[#2a2a3e] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#ff5722]"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Total Logins Recorded</label>
                <input
                  type="number"
                  min="0"
                  value={editTotalLogins}
                  onChange={(e) => setEditTotalLogins(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#151522] border border-[#2a2a3e] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#ff5722]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#1f1f2e]">
                <button
                  type="button"
                  onClick={() => setIsEditCountersModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#181824] hover:bg-[#202030] text-neutral-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-[#ff851a] hover:from-amber-400 hover:to-[#ff9933] text-black font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Counters</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
