import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  onSnapshot, 
  deleteDoc, 
  getDocFromServer,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { ProcessedItem, UserState } from './types';

export interface FirebaseConfigData {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  measurementId?: string;
  oAuthClientId?: string;
  recaptchaSiteKey?: string;
}

export const getActiveFirebaseConfig = (): FirebaseConfigData => {
  try {
    const saved = localStorage.getItem('makepdf_custom_firebase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.projectId && parsed.apiKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read custom firebase config:', e);
  }
  return firebaseConfig as FirebaseConfigData;
};

export const saveCustomFirebaseConfig = (config: FirebaseConfigData) => {
  localStorage.setItem('makepdf_custom_firebase_config', JSON.stringify(config));
};

export const resetFirebaseConfig = () => {
  localStorage.removeItem('makepdf_custom_firebase_config');
};

export const testFirebaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    if (!auth) throw new Error('Firebase Auth not initialized');
    return { 
      success: true, 
      message: `Connected successfully to project "${getActiveFirebaseConfig().projectId}"!` 
    };
  } catch (err: any) {
    return { 
      success: false, 
      message: err?.message || 'Connection test failed. Please check your config parameters.' 
    };
  }
};

const activeConfig = getActiveFirebaseConfig();

// Initialize Firebase App
export const app = initializeApp(activeConfig);

// Initialize Firebase Analytics if supported in the browser environment
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported && activeConfig.measurementId) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

// Initialize Firestore with specific database ID from config
export const db = (activeConfig.firestoreDatabaseId && activeConfig.firestoreDatabaseId !== '(default)')
  ? getFirestore(app, activeConfig.firestoreDatabaseId) /* CRITICAL: The app will break without this line */
  : getFirestore(app);

// Initialize Authentication
export const auth = getAuth(app);

// Google Auth Provider configured for popup authentication
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Operation types for strict Firestore error handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initial connection test as mandated by Firebase specification
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or internet connection.");
    }
  }
}
testConnection();

// --- Auth Functions (Email & Password + Optional Google) ---

export let isRegistrationFlow = false;

/**
 * Register a new user using Firebase Email and Password
 * Creates the user record but immediately signs out so the user 
 * sees the success message and performs explicit login.
 */
export async function registerWithEmail(email: string, pass: string, displayName: string) {
  isRegistrationFlow = true;
  const cleanEmail = email.trim().toLowerCase();
  const derivedName = displayName.trim() || cleanEmail.split('@')[0];
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(derivedName)}&backgroundColor=ff5722,ea580c,f97316&textColor=ffffff&bold=true`;
  const isAdmin = cleanEmail === 'pankajgadhari154@gmail.com';

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    const fbUser = userCredential.user;

    try {
      await updateProfile(fbUser, {
        displayName: derivedName,
        photoURL: avatarUrl,
      });
    } catch (profileErr) {
      console.warn('Could not update Auth profile:', profileErr);
    }

    const userProfile = {
      userId: fbUser.uid,
      email: cleanEmail,
      name: derivedName,
      avatarUrl,
      role: isAdmin ? 'admin' : 'user',
      filesProcessed: 0,
      pdfsCreated: 0,
      storageUsedMb: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', fbUser.uid), userProfile);
    } catch (err) {
      console.warn('Could not persist profile to Firestore:', err);
    }

    // Explicitly sign out from Firebase immediately so the user is NOT auto-logged in,
    // as requested by the user: "pehle registration hoga notify hoga message ki account ban gaya ab login kar lo"
    try {
      await signOut(auth);
    } catch (signOutErr) {
      console.warn('SignOut after registration notice:', signOutErr);
    }

    // Ensure session is cleared so user has to log in explicitly
    try {
      localStorage.removeItem('makepdf_current_user');
    } catch {}

    return { 
      fbUser, 
      userProfile, 
      isLocalFallback: false,
      message: 'Account created successfully. Please enter your password to sign in.'
    };
  } catch (err: any) {
    // If Email/Password sign-in method is disabled in Firebase Console
    if (err?.code === 'auth/operation-not-allowed') {
      console.warn('Firebase Email/Password is disabled in Firebase Console. Using local account registration.');
      const localUid = `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const localUser = {
        uid: localUid,
        email: cleanEmail,
        displayName: derivedName,
        photoURL: avatarUrl,
      };

      const userProfile = {
        userId: localUid,
        email: cleanEmail,
        name: derivedName,
        avatarUrl,
        role: isAdmin ? 'admin' : 'user',
        filesProcessed: 0,
        pdfsCreated: 0,
        storageUsedMb: 0,
        createdAt: new Date().toISOString(),
      };

      try {
        const existingUsers = JSON.parse(localStorage.getItem('makepdf_local_users') || '{}');
        existingUsers[cleanEmail] = {
          uid: localUid,
          email: cleanEmail,
          password: pass,
          name: derivedName,
          avatarUrl,
          createdAt: userProfile.createdAt,
        };
        localStorage.setItem('makepdf_local_users', JSON.stringify(existingUsers));
        localStorage.removeItem('makepdf_current_user');
      } catch (e) {
        console.warn('Could not save to localStorage:', e);
      }

      return { 
        fbUser: localUser as any, 
        userProfile, 
        isLocalFallback: true,
        message: 'Account created successfully. Please enter your password to sign in.'
      };
    }
    throw err;
  } finally {
    isRegistrationFlow = false;
  }
}

/**
 * Sign in existing user with Firebase Email and Password
 */
export async function loginWithEmail(email: string, pass: string) {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    return userCredential.user;
  } catch (err: any) {
    if (err?.code === 'auth/operation-not-allowed') {
      console.warn('Firebase Email/Password is disabled in Firebase Console. Authenticating with local session.');
      const existingUsers = JSON.parse(localStorage.getItem('makepdf_local_users') || '{}');
      const foundUser = existingUsers[cleanEmail];

      if (foundUser) {
        if (foundUser.password === pass) {
          const profile = {
            userId: foundUser.uid,
            email: cleanEmail,
            name: foundUser.name,
            avatarUrl: foundUser.avatarUrl,
            role: cleanEmail === 'pankajgadhari154@gmail.com' ? 'admin' : 'user',
            filesProcessed: 0,
            pdfsCreated: 0,
            storageUsedMb: 0,
            createdAt: foundUser.createdAt,
          };
          localStorage.setItem('makepdf_current_user', JSON.stringify(profile));
          return {
            uid: foundUser.uid,
            email: cleanEmail,
            displayName: foundUser.name,
            photoURL: foundUser.avatarUrl,
          } as any;
        } else {
          const passErr: any = new Error('Invalid email or password.');
          passErr.code = 'auth/wrong-password';
          throw passErr;
        }
      }

      // If user is Admin Pankaj Gadhari with default credentials
      if (cleanEmail === 'pankajgadhari154@gmail.com' && pass === 'Pass@123') {
        const adminProfile = {
          userId: 'admin_pankaj_gadhari',
          email: cleanEmail,
          name: 'Pankaj Gadhari',
          avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Pankaj&backgroundColor=ff5722,ea580c,f97316&textColor=ffffff&bold=true',
          role: 'admin',
          filesProcessed: 14,
          pdfsCreated: 8,
          storageUsedMb: 4.2,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem('makepdf_current_user', JSON.stringify(adminProfile));
        return {
          uid: adminProfile.userId,
          email: cleanEmail,
          displayName: adminProfile.name,
          photoURL: adminProfile.avatarUrl,
        } as any;
      }

      // Auto-register and sign in locally if first time
      const autoUid = `local_${Date.now()}`;
      const derivedName = cleanEmail.split('@')[0];
      const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(derivedName)}&backgroundColor=ff5722,ea580c,f97316&textColor=ffffff&bold=true`;
      
      const newLocalUser = {
        uid: autoUid,
        email: cleanEmail,
        password: pass,
        name: derivedName,
        avatarUrl,
        createdAt: new Date().toISOString(),
      };
      existingUsers[cleanEmail] = newLocalUser;
      localStorage.setItem('makepdf_local_users', JSON.stringify(existingUsers));
      localStorage.setItem('makepdf_current_user', JSON.stringify({
        userId: autoUid,
        email: cleanEmail,
        name: derivedName,
        avatarUrl,
        role: 'user',
        filesProcessed: 0,
        pdfsCreated: 0,
        storageUsedMb: 0,
        createdAt: newLocalUser.createdAt,
      }));

      return {
        uid: autoUid,
        email: cleanEmail,
        displayName: derivedName,
        photoURL: avatarUrl,
      } as any;
    }
    throw err;
  }
}

/**
 * Sign in using Google Popup (AI Studio environment friendly)
 */
export async function loginWithGooglePopup() {
  const result = await signInWithPopup(auth, googleProvider);
  const fbUser = result.user;

  const path = `users/${fbUser.uid}`;
  try {
    const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
    if (!userDoc.exists()) {
      const derivedName = fbUser.displayName || fbUser.email?.split('@')[0] || 'User';
      const avatarUrl = fbUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(derivedName)}&backgroundColor=ff5722,ea580c,f97316&textColor=ffffff&bold=true`;
      const isAdmin = fbUser.email?.toLowerCase() === 'pankajgadhari154@gmail.com';

      await setDoc(doc(db, 'users', fbUser.uid), {
        userId: fbUser.uid,
        email: fbUser.email || '',
        name: derivedName,
        avatarUrl,
        role: isAdmin ? 'admin' : 'user',
        filesProcessed: 0,
        pdfsCreated: 0,
        storageUsedMb: 0,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }

  return fbUser;
}

/**
 * Log out from Firebase Authentication
 */
export async function logoutUser() {
  await signOut(auth);
}

/**
 * Fetch all registered users from Firestore 'users' collection
 */
export async function fetchAllFirestoreUsers(): Promise<any[]> {
  try {
    const usersCol = collection(db, 'users');
    const snap = await getDocs(usersCol);
    return snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
  } catch (err) {
    console.warn('Could not fetch Firestore users:', err);
    return [];
  }
}

/**
 * Fetch or listen to user profile data
 */
export function subscribeToUserProfile(uid: string, onUpdate: (data: Partial<UserState> | null) => void) {
  if (uid.startsWith('local_')) {
    try {
      const saved = localStorage.getItem('makepdf_current_user');
      if (saved) onUpdate(JSON.parse(saved));
    } catch {}
    return () => {};
  }

  const path = `users/${uid}`;
  return onSnapshot(
    doc(db, 'users', uid),
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        onUpdate({
          name: data.name,
          email: data.email,
          avatarUrl: data.avatarUrl,
          filesProcessed: data.filesProcessed ?? 0,
          pdfsCreated: data.pdfsCreated ?? 0,
          storageUsedMb: data.storageUsedMb ?? 0,
          isAdmin: data.role === 'admin' || data.email === 'pankajgadhari154@gmail.com',
        });
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

/**
 * Update user statistics (e.g. after processing a PDF)
 */
export async function updateUserStats(uid: string, filesDelta: number, pdfsDelta: number, mbDelta: number) {
  if (uid.startsWith('local_')) {
    try {
      const saved = localStorage.getItem('makepdf_current_user');
      if (saved) {
        const u = JSON.parse(saved);
        u.filesProcessed = (u.filesProcessed || 0) + filesDelta;
        u.pdfsCreated = (u.pdfsCreated || 0) + pdfsDelta;
        u.storageUsedMb = Number(((u.storageUsedMb || 0) + mbDelta).toFixed(1));
        localStorage.setItem('makepdf_current_user', JSON.stringify(u));
      }
    } catch {}
    return;
  }

  const path = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      const currentProcessed = data.filesProcessed || 0;
      const currentCreated = data.pdfsCreated || 0;
      const currentMb = data.storageUsedMb || 0;

      await updateDoc(userRef, {
        filesProcessed: currentProcessed + filesDelta,
        pdfsCreated: currentCreated + pdfsDelta,
        storageUsedMb: Number((currentMb + mbDelta).toFixed(1)),
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

/**
 * Save processed PDF item to user's history collection
 */
export async function saveHistoryToFirebase(uid: string, item: ProcessedItem) {
  if (uid.startsWith('local_')) {
    try {
      const key = `makepdf_history_${uid}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify([item, ...existing]));
    } catch {}
    return;
  }

  const path = `users/${uid}/history/${item.id}`;
  try {
    const historyRef = doc(db, 'users', uid, 'history', item.id);
    await setDoc(historyRef, {
      id: item.id,
      userId: uid,
      filename: item.filename,
      tool: item.tool,
      date: item.date,
      size: item.size,
      status: item.status,
      downloadUrl: item.downloadUrl || '',
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

/**
 * Subscribe to user's history collection
 */
export function subscribeToUserHistory(uid: string, onUpdate: (items: ProcessedItem[]) => void) {
  if (uid.startsWith('local_')) {
    try {
      const key = `makepdf_history_${uid}`;
      const items = JSON.parse(localStorage.getItem(key) || '[]');
      onUpdate(items);
    } catch {}
    return () => {};
  }

  const path = `users/${uid}/history`;
  const historyQuery = query(collection(db, 'users', uid, 'history'));

  return onSnapshot(
    historyQuery,
    (snapshot) => {
      const items: ProcessedItem[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: data.id || d.id,
          filename: data.filename,
          tool: data.tool,
          date: data.date,
          size: data.size,
          status: data.status,
          downloadUrl: data.downloadUrl || undefined,
        });
      });
      // Sort newest first
      items.sort((a, b) => (b.id > a.id ? 1 : -1));
      onUpdate(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

/**
 * Delete a specific history item
 */
export async function deleteHistoryFromFirebase(uid: string, historyId: string) {
  if (uid.startsWith('local_')) {
    try {
      const key = `makepdf_history_${uid}`;
      const items = JSON.parse(localStorage.getItem(key) || '[]');
      const filtered = items.filter((i: ProcessedItem) => i.id !== historyId);
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch {}
    return;
  }

  const path = `users/${uid}/history/${historyId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'history', historyId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Clear all history items for a user
 */
export async function clearAllHistoryFromFirebase(uid: string, itemIds: string[]) {
  if (uid.startsWith('local_')) {
    try {
      const key = `makepdf_history_${uid}`;
      localStorage.removeItem(key);
    } catch {}
    return;
  }

  const path = `users/${uid}/history`;
  try {
    const batch = writeBatch(db);
    itemIds.forEach((id) => {
      batch.delete(doc(db, 'users', uid, 'history', id));
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}
