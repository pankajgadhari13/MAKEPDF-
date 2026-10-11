import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, ShieldAlert, Loader2, Database, CheckCircle2 } from 'lucide-react';
import { UserState } from '../types';
import { recordUserLogin, recordUserRegistration, isAdminEmail, ADMIN_CREDENTIALS } from '../utils/analyticsStore';
import { registerWithEmail, loginWithEmail, loginWithGooglePopup } from '../firebase';
import { Language, translations } from '../utils/translations';

interface AuthModalProps {
  mode: 'login' | 'register' | 'admin';
  onClose: () => void;
  onLoginSuccess: (user: Partial<UserState>) => void;
  onOpenAdminPanel?: () => void;
  onOpenFirebaseConfig?: () => void;
  lang?: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  mode: initialMode,
  onClose,
  onLoginSuccess,
  onOpenAdminPanel,
  onOpenFirebaseConfig,
  lang = 'en',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'admin'>(initialMode);
  const t = translations[lang];
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialMode === 'admin' ? ADMIN_CREDENTIALS.email : '');
  const [password, setPassword] = useState(initialMode === 'admin' ? ADMIN_CREDENTIALS.password : '');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationNotice, setRegistrationNotice] = useState<string | null>(null);

  const getReadableFirebaseError = (err: any): string => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email address is already registered. Please sign in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please verify and try again.';
      case 'auth/operation-not-allowed':
        return 'Email/Password sign-in is disabled in Firebase Console. Please enable "Email/Password" under Firebase Console > Authentication > Sign-in method.';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Please wait a moment and try again.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed before completion.';
      default:
        return err?.message || 'Authentication failed. Please check your credentials.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all required credentials.');
      return;
    }

    if (mode === 'admin') {
      if (email.trim().toLowerCase() !== ADMIN_CREDENTIALS.email.toLowerCase() || password !== ADMIN_CREDENTIALS.password) {
        setError(`Invalid Admin credentials. Required: ${ADMIN_CREDENTIALS.email} / Pass@123`);
        return;
      }
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please provide your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'register') {
        await registerWithEmail(email, password, name);
        recordUserRegistration({
          email,
          name: name.trim() || email.split('@')[0],
        });
        // Do NOT log in immediately. Notify that account was created and prompt to sign in:
        setRegistrationNotice(
          'Account created successfully. Please enter your password to sign in.'
        );
        setMode('login');
        setPassword('');
        setConfirmPassword('');
        setError(null);
        setIsLoading(false);
        return;
      } else if (mode === 'login') {
        const isUserAdmin = isAdminEmail(email);
        let fbUser: any = null;
        let derivedName = email.split('@')[0];
        let avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(derivedName)}&backgroundColor=ff5722,ea580c,f97316&textColor=ffffff&bold=true`;

        try {
          fbUser = await loginWithEmail(email, password);
          derivedName = fbUser.displayName || derivedName;
          avatar = fbUser.photoURL || avatar;
        } catch (authErr: any) {
          // If admin credentials matched locally
          if (isUserAdmin && password.trim() === ADMIN_CREDENTIALS.password) {
            derivedName = 'Pankaj Gadhari';
          } else {
            throw authErr;
          }
        }

        recordUserLogin(
          { email: email, name: derivedName, avatarUrl: avatar },
          isUserAdmin ? 'Super Admin Authentication' : 'Firebase Email & Password Sign In'
        );
        onLoginSuccess({
          isLoggedIn: true,
          name: derivedName,
          email: email,
          avatarUrl: avatar,
          isAdmin: isUserAdmin,
        });

        if (isUserAdmin && onOpenAdminPanel) {
          onOpenAdminPanel();
        }
      } else {
        // Direct Admin mode
        const derivedName = 'Pankaj Gadhari';
        const generatedAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=Pankaj&backgroundColor=ff5722,ea580c,f97316&textColor=ffffff&bold=true`;

        try {
          await loginWithEmail(email, password);
        } catch {
          // Fallback if local admin credentials provided
        }

        recordUserLogin(
          { email, name: derivedName, avatarUrl: generatedAvatar },
          'Super Admin Authentication'
        );

        onLoginSuccess({
          isLoggedIn: true,
          name: derivedName,
          email: email,
          avatarUrl: generatedAvatar,
          isAdmin: true,
        });

        if (onOpenAdminPanel) {
          onOpenAdminPanel();
        }
      }

      onClose();
    } catch (err: any) {
      console.warn('Firebase Auth notice:', err);
      setError(getReadableFirebaseError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const fbUser = await loginWithGooglePopup();
      const derivedName = fbUser.displayName || fbUser.email?.split('@')[0] || 'User';
      const isUserAdmin = isAdminEmail(fbUser.email || '');
      const avatar = fbUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(derivedName)}&backgroundColor=ff5722,ea580c,f97316&textColor=ffffff&bold=true`;

      recordUserLogin(
        { email: fbUser.email || '', name: derivedName, avatarUrl: avatar },
        'Google OAuth Authentication'
      );

      onLoginSuccess({
        isLoggedIn: true,
        name: derivedName,
        email: fbUser.email || '',
        avatarUrl: avatar,
        isAdmin: isUserAdmin,
      });
      onClose();
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setError(getReadableFirebaseError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl bg-[#12121a] border border-[#2b2b3d] p-4.5 sm:p-7 shadow-2xl my-auto max-h-[94vh] flex flex-col overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1f1f2c] transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tab switch between user sign in & register */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0b0b0f] rounded-xl border border-[#20202e] mb-3.5 sm:mb-5 shrink-0 pr-8 sm:pr-1">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'login' ? 'bg-[#ff5722] text-black font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
              setRegistrationNotice(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'register' ? 'bg-[#ff5722] text-black font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        <div className="mb-3.5 sm:mb-5 shrink-0">
          <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-[#ff851a] uppercase mb-0.5 sm:mb-1">
            {mode === 'admin' ? (
              <>
                <ShieldAlert className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#ff5722]" />
                <span className="text-[#ff5722] font-bold">SUPER ADMIN ACCESS</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>SECURE FIREBASE AUTHENTICATION</span>
              </>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            {mode === 'admin'
              ? t.auth.adminTitle
              : mode === 'login'
              ? t.auth.signInTitle
              : t.auth.registerTitle}
          </h2>
          <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5 sm:mt-1">
            {mode === 'admin'
              ? t.auth.adminNotice
              : mode === 'login'
              ? (lang === 'hi' ? 'दस्तावेज़ सिंक करने के लिए अपने ईमेल और पासवर्ड से साइन इन करें।' : 'Sign in using your email and password to sync your documents.')
              : (lang === 'hi' ? 'PDF बनाने और प्रबंधित करने के लिए अपने ईमेल से साइन अप करें।' : 'Sign up with your email to start creating and managing PDFs.')}
          </p>
        </div>

        {/* Success notification banner after registration */}
        {registrationNotice && mode === 'login' && (
          <div className="mb-3 sm:mb-4 p-3 sm:p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5 sm:gap-3 animate-in fade-in slide-in-from-top-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-emerald-300 text-xs sm:text-sm">
                {lang === 'hi' ? 'खाता सफलतापूर्वक बन गया' : 'Account Created Successfully'}
              </p>
              <p className="text-emerald-200/90 text-[11px] sm:text-xs mt-0.5 sm:mt-1 leading-relaxed">
                {registrationNotice}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 break-words leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-[11px] sm:text-xs font-semibold text-neutral-300">{t.auth.fullName}</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lang === 'hi' ? 'उदा. राहुल शर्मा' : 'e.g. John Doe'}
                  required
                  className="w-full bg-[#0b0b0f] border border-[#272738] rounded-xl pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] sm:text-xs font-semibold text-neutral-300">
              {mode === 'admin' ? (lang === 'hi' ? 'एडमिन ईमेल' : 'Admin Email') : t.auth.emailAddress}
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === 'admin' ? 'pankajgadhari154@gmail.com' : 'name@company.com'}
                required
                className="w-full bg-[#0b0b0f] border border-[#272738] rounded-xl pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] sm:text-xs font-semibold text-neutral-300">
                {mode === 'admin' ? (lang === 'hi' ? 'एडमिन पासवर्ड' : 'Admin Password') : t.auth.password}
              </label>
              {mode === 'admin' && (
                <span className="text-[10px] sm:text-[11px] font-mono text-emerald-400">Pass@123</span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-[#0b0b0f] border border-[#272738] rounded-xl pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-[11px] sm:text-xs font-semibold text-neutral-300">{t.auth.confirmPassword}</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-[#0b0b0f] border border-[#272738] rounded-xl pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 sm:py-3 rounded-xl font-bold text-xs text-black bg-gradient-to-r from-[#ff851a] to-[#ff5500] hover:from-[#ff9933] hover:to-[#ff661a] shadow-[0_0_15px_rgba(255,107,0,0.35)] transition-all cursor-pointer mt-1.5 sm:mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-black" />}
            <span>
              {mode === 'admin'
                ? t.auth.adminLoginBtn
                : mode === 'login'
                ? t.auth.signInBtn
                : t.auth.registerBtn}
            </span>
          </button>
        </form>

        {/* Google Popup Sign-in Option */}
        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-[#1e1e2b] shrink-0">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2 sm:py-2.5 px-3 rounded-xl bg-[#171724] hover:bg-[#202030] border border-[#2b2b3d] text-xs font-semibold text-neutral-200 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{t.auth.continueWithGoogle}</span>
          </button>
        </div>

        <div className="mt-3.5 sm:mt-5 pt-3 sm:pt-4 border-t border-[#1e1e2b] text-center text-xs text-neutral-400 shrink-0">
          {mode === 'login' ? (
            <span>
              {t.auth.dontHaveAccount}{' '}
              <button
                onClick={() => {
                  setMode('register');
                  setError(null);
                  setRegistrationNotice(null);
                }}
                className="text-[#ff851a] font-semibold hover:underline cursor-pointer"
              >
                {t.auth.registerHere}
              </button>
            </span>
          ) : mode === 'register' ? (
            <span>
              {t.auth.alreadyHaveAccount}{' '}
              <button
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-[#ff851a] font-semibold hover:underline cursor-pointer"
              >
                {t.auth.signInHere}
              </button>
            </span>
          ) : (
            <span>
              Return to{' '}
              <button
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-[#ff851a] font-semibold hover:underline cursor-pointer"
              >
                standard sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
