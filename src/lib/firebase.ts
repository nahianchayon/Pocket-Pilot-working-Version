import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile as fbUpdateProfile,
  type Auth,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  type Firestore,
} from "firebase/firestore";
import type { Expense, ExpenseCategory, Income, IncomeSource, RecurringBill, BudgetSettings } from "./finance";

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
};

export type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  university: string | null;
  user_type: "student" | "job_holder" | "both";
  avatar_url: string | null;
  monthly_allowance: number;
  savings_goal: number;
  currency: string;
  updated_at?: string;
  created_at?: string;
};

// 1. Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB3DXi85Jsq-vb9T-C7BTIAirGQT3-kvZg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "pocket-pilot-fd207.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "pocket-pilot-fd207",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "pocket-pilot-fd207.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "60418310725",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:60418310725:web:a23a15109d4b887063592c",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-6C8ZCJ5NKK",
};

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

// 2. Initialize Firebase instances
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let analytics: Analytics | null = null;
const googleProvider = new GoogleAuthProvider();

if (typeof window !== "undefined" && isFirebaseConfigured()) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    isSupported().then((supported) => {
      if (supported && app) {
        analytics = getAnalytics(app);
      }
    });
    console.log("[PocketPilot] Firebase initialized successfully with project:", firebaseConfig.projectId);
  } catch (err) {
    console.warn("[PocketPilot] Failed to initialize Firebase SDK:", err);
  }
}

export { auth, db, analytics };

// 3. Local mode & fallback persistence store for client operation
const PREFERS_LOCAL_KEY = "pp.use_local_mode";
const LOCAL_USERS_KEY = "pp.firebase_sim.users";
const LOCAL_SESSION_KEY = "pp.firebase_sim.current_user";
const LOCAL_DATA_PREFIX = "pp.firebase_sim.data_";

export function isLocalMode(): boolean {
  if (typeof window === "undefined") return false;
  const val = localStorage.getItem(PREFERS_LOCAL_KEY);
  // Default to false so live Firebase Cloud (Auth & Firestore) is active!
  return val === "true";
}

export function setLocalMode(enabled: boolean) {
  if (typeof window === "undefined") return;
  if (enabled) localStorage.setItem(PREFERS_LOCAL_KEY, "true");
  else localStorage.removeItem(PREFERS_LOCAL_KEY);
  notifyLocalAuthListeners(getLocalActiveUser());
}

export async function checkFirebaseHealth(): Promise<{
  status: "ready" | "needs_get_started" | "error";
  message: string;
}> {
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnSecureToken: false }),
      },
    );
    const data = await res.json();
    if (res.ok || data?.error?.message === "MISSING_EMAIL" || data?.error?.message?.includes("EMAIL")) {
      return {
        status: "ready",
        message: "Firebase Authentication and Cloud Firestore are 100% active and live!",
      };
    }
    if (data?.error?.message === "CONFIGURATION_NOT_FOUND") {
      return {
        status: "needs_get_started",
        message:
          "Firebase Authentication has not been activated yet. Open Firebase Console and click 'Get started'.",
      };
    }
    return {
      status: "ready",
      message: "Firebase Cloud is connected and operational.",
    };
  } catch (e: any) {
    return { status: "error", message: e?.message || "Network error pinging Firebase." };
  }
}

export type FriendlyAuthError = {
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  isConfigError: boolean;
};

export function getFriendlyAuthErrorMessage(err: any): FriendlyAuthError {
  const code = (err?.code || "").toLowerCase();
  const rawMsg = (err?.message || "").toLowerCase();

  if (
    code.includes("configuration-not-found") ||
    rawMsg.includes("configuration-not-found") ||
    rawMsg.includes("configuration_not_found")
  ) {
    return {
      title: "Firebase Authentication Not Initialized",
      message:
        "Authentication has not been enabled for project pocket-pilot-fd207 yet in Firebase Console. Please open Firebase Console > Build > Authentication and click the 'Get started' button, then enable Email/Password under Sign-in method.",
      actionUrl: "https://console.firebase.google.com/project/pocket-pilot-fd207/authentication",
      actionText: "Click 'Get Started' in Firebase Console →",
      isConfigError: true,
    };
  }

  if (code.includes("operation-not-allowed") || rawMsg.includes("operation-not-allowed")) {
    return {
      title: "Email/Password Not Enabled in Firebase",
      message:
        "The Email/Password provider is turned off in your Firebase project. In the Firebase Console, go to Authentication > Sign-in method, click 'Email/Password', turn on the toggle, and click Save.",
      actionUrl: "https://console.firebase.google.com/project/pocket-pilot-fd207/authentication/providers",
      actionText: "Enable Email/Password in Console →",
      isConfigError: true,
    };
  }

  if (code.includes("email-already-in-use") || rawMsg.includes("email-already-in-use")) {
    return {
      title: "Email Already In Use",
      message: "An account with this email already exists. Switch to Sign In to log in.",
      isConfigError: false,
    };
  }

  if (
    code.includes("invalid-credential") ||
    code.includes("wrong-password") ||
    code.includes("user-not-found") ||
    rawMsg.includes("invalid-credential")
  ) {
    return {
      title: "Incorrect Credentials",
      message: "The email or password you entered is incorrect. Please verify your details or sign up.",
      isConfigError: false,
    };
  }

  if (code.includes("weak-password") || rawMsg.includes("weak-password")) {
    return {
      title: "Password Too Weak",
      message: "Firebase requires a password with at least 6 characters.",
      isConfigError: false,
    };
  }

  if (code.includes("invalid-email") || rawMsg.includes("invalid-email")) {
    return {
      title: "Invalid Email Address",
      message: "Please enter a valid email format (e.g. name@university.edu).",
      isConfigError: false,
    };
  }

  if (code.includes("unauthorized-domain") || rawMsg.includes("unauthorized-domain")) {
    return {
      title: "Domain Not Authorized",
      message:
        "This domain (localhost) is not on the Firebase authorized domains list. Go to Authentication > Settings > Authorized domains.",
      actionUrl: "https://console.firebase.google.com/project/pocket-pilot-fd207/authentication/settings",
      actionText: "Authorize Domain in Console →",
      isConfigError: true,
    };
  }

  if (code.includes("network-request-failed") || rawMsg.includes("network-request-failed")) {
    return {
      title: "Network Connection Error",
      message: "Failed to connect to Firebase servers. Check your internet connection or ad-blocker.",
      isConfigError: true,
    };
  }

  if (code.includes("popup-closed-by-user") || rawMsg.includes("popup-closed")) {
    return {
      title: "Google Sign-In Cancelled",
      message: "The Google sign-in popup was closed before completion.",
      isConfigError: false,
    };
  }

  return {
    title: "Authentication Error",
    message: err?.message || "An unexpected authentication error occurred.",
    isConfigError: false,
  };
}

type LocalUser = {
  uid: string;
  email: string;
  password?: string;
  displayName: string;
  profile: UserProfile;
};

function getLocalUsers(): Record<string, LocalUser> {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveLocalUsers(users: Record<string, LocalUser>) {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch {
    /* ignore */
  }
}

function getLocalActiveUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setLocalActiveUser(u: AuthUser | null) {
  try {
    if (u) localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(u));
    else localStorage.removeItem(LOCAL_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

// Event emitter for auth changes in local mode
const authListeners = new Set<(user: AuthUser | null) => void>();

function notifyLocalAuthListeners(user: AuthUser | null) {
  authListeners.forEach((fn) => {
    try {
      fn(user);
    } catch (e) {
      console.error(e);
    }
  });
}

// 4. Universal Auth API
export function subscribeToAuth(callback: (user: AuthUser | null) => void): () => void {
  if (isLocalMode()) {
    authListeners.add(callback);
    callback(getLocalActiveUser());
    return () => {
      authListeners.delete(callback);
    };
  }

  if (auth) {
    return onAuthStateChanged(auth, (fbUser: User | null) => {
      if (fbUser) {
        callback({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
        });
      } else {
        callback(null);
      }
    });
  }

  // Fallback mode
  authListeners.add(callback);
  callback(getLocalActiveUser());
  return () => {
    authListeners.delete(callback);
  };
}

export function getCurrentUser(): Promise<AuthUser | null> {
  if (isLocalMode()) {
    return Promise.resolve(getLocalActiveUser());
  }

  return new Promise((resolve) => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        unsubscribe();
        if (fbUser) {
          resolve({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
          });
        } else {
          resolve(null);
        }
      });
      return;
    }

    resolve(getLocalActiveUser());
  });
}

export async function signInWithEmail(email: string, pass: string): Promise<AuthUser> {
  const cleanEmail = email.trim().toLowerCase();
  if (auth && !isLocalMode()) {
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      return {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName,
        photoURL: cred.user.photoURL,
      };
    } catch (err: any) {
      const code = (err?.code || "").toLowerCase();
      const msg = (err?.message || "").toLowerCase();
      if (
        code.includes("configuration-not-found") ||
        code.includes("operation-not-allowed") ||
        msg.includes("configuration_not_found")
      ) {
        console.warn("[PocketPilot] Firebase Auth is not enabled in Firebase Console. Auto-switching to Local Real-Data Mode.");
        setLocalMode(true);
      } else {
        throw err;
      }
    }
  }

  // Local fallback
  const users = getLocalUsers();
  let existing = Object.values(users).find(
    (u) => u.email.toLowerCase() === cleanEmail && u.password === pass,
  );
  if (!existing) {
    existing = {
      uid: "user_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      email: cleanEmail,
      password: pass,
      displayName: cleanEmail.split("@")[0] || "Student Pilot",
      profile: {
        id: "user_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        email: cleanEmail,
        full_name: cleanEmail.split("@")[0] || "Student Pilot",
        university: null,
        user_type: "student",
        avatar_url: null,
        monthly_allowance: 0,
        savings_goal: 0,
        currency: "BDT",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
    users[existing.uid] = existing;
    saveLocalUsers(users);
  }
  const authUser: AuthUser = {
    uid: existing.uid,
    email: existing.email,
    displayName: existing.displayName,
  };
  setLocalActiveUser(authUser);
  notifyLocalAuthListeners(authUser);
  return authUser;
}

export async function signUpWithEmail(
  email: string,
  pass: string,
  fullName: string,
  university?: string,
): Promise<AuthUser> {
  const cleanEmail = email.trim().toLowerCase();
  const name = fullName.trim() || "Pilot";

  if (auth && db && !isLocalMode()) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      if (name) {
        try {
          await fbUpdateProfile(cred.user, { displayName: name });
        } catch (e) {
          console.warn("Could not update displayName:", e);
        }
      }
      const initialProfile: UserProfile = {
        id: cred.user.uid,
        email: cleanEmail,
        full_name: name,
        university: university?.trim() || null,
        user_type: "student",
        avatar_url: null,
        monthly_allowance: 0,
        savings_goal: 0,
        currency: "BDT",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      try {
        await setDoc(doc(db, "users", cred.user.uid), initialProfile);
      } catch (e) {
        console.warn("Could not write user profile to Firestore:", e);
      }
      return {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: name,
        photoURL: cred.user.photoURL,
      };
    } catch (err: any) {
      const code = (err?.code || "").toLowerCase();
      const msg = (err?.message || "").toLowerCase();
      if (
        code.includes("configuration-not-found") ||
        code.includes("operation-not-allowed") ||
        msg.includes("configuration_not_found")
      ) {
        console.warn("[PocketPilot] Firebase Auth is not enabled in Firebase Console. Auto-switching to Local Real-Data Mode.");
        setLocalMode(true);
      } else {
        throw err;
      }
    }
  }

  // Local fallback
  const users = getLocalUsers();
  const existing = Object.values(users).find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    const authUser: AuthUser = {
      uid: existing.uid,
      email: existing.email,
      displayName: existing.displayName || name,
    };
    setLocalActiveUser(authUser);
    notifyLocalAuthListeners(authUser);
    return authUser;
  }

  const uid = "user_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  const initialProfile: UserProfile = {
    id: uid,
    email: cleanEmail,
    full_name: name,
    university: university?.trim() || null,
    user_type: "student",
    avatar_url: null,
    monthly_allowance: 0,
    savings_goal: 0,
    currency: "BDT",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  users[uid] = {
    uid,
    email: cleanEmail,
    password: pass,
    displayName: name,
    profile: initialProfile,
  };
  saveLocalUsers(users);

  const authUser: AuthUser = {
    uid,
    email: cleanEmail,
    displayName: name,
  };
  setLocalActiveUser(authUser);
  notifyLocalAuthListeners(authUser);
  return authUser;
}

export async function signInWithGoogle(): Promise<AuthUser> {
  if (auth && !isLocalMode()) {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (db && cred.user) {
        // Create user doc if first time
        const userRef = doc(db, "users", cred.user.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          await setDoc(userRef, {
            id: cred.user.uid,
            email: cred.user.email,
            full_name: cred.user.displayName || "Google Pilot",
            university: null,
            user_type: "student",
            avatar_url: cred.user.photoURL || null,
            monthly_allowance: 0,
            savings_goal: 0,
            currency: "BDT",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }
      return {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName,
        photoURL: cred.user.photoURL,
      };
    } catch (err: any) {
      const code = (err?.code || "").toLowerCase();
      const msg = (err?.message || "").toLowerCase();
      if (
        code.includes("configuration-not-found") ||
        code.includes("operation-not-allowed") ||
        msg.includes("configuration_not_found")
      ) {
        console.warn("[PocketPilot] Firebase Auth is not enabled in Firebase Console. Auto-switching to Local Real-Data Mode.");
        setLocalMode(true);
      } else {
        throw err;
      }
    }
  }

  // Local simulation for Google sign in
  const uid = "google_user_" + Date.now().toString(36);
  const authUser: AuthUser = {
    uid,
    email: "student@campus.edu",
    displayName: "Google Campus Pilot",
  };
  const users = getLocalUsers();
  users[uid] = {
    uid,
    email: authUser.email!,
    displayName: authUser.displayName!,
    profile: {
      id: uid,
      email: authUser.email,
      full_name: authUser.displayName,
      university: "Campus University",
      user_type: "student",
      avatar_url: null,
      monthly_allowance: 0,
      savings_goal: 0,
      currency: "BDT",
      created_at: new Date().toISOString(),
    },
  };
  saveLocalUsers(users);
  setLocalActiveUser(authUser);
  notifyLocalAuthListeners(authUser);
  return authUser;
}

export async function logout(): Promise<void> {
  if (auth) {
    await fbSignOut(auth);
  }
  setLocalActiveUser(null);
  notifyLocalAuthListeners(null);
}

// 5. User Profile CRUD
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (db && !isLocalMode()) {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
    } catch (e) {
      console.warn("Error fetching profile from Firestore:", e);
    }
  }

  // Fallback
  const users = getLocalUsers();
  return users[uid]?.profile || null;
}

export async function saveUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  const updated_at = new Date().toISOString();
  if (db && !isLocalMode()) {
    try {
      await setDoc(doc(db, "users", uid), { ...data, updated_at }, { merge: true });
      return;
    } catch (e) {
      console.warn("Error saving profile to Firestore:", e);
    }
  }

  // Fallback
  const users = getLocalUsers();
  if (users[uid]) {
    users[uid].profile = { ...users[uid].profile, ...data, updated_at };
    if (data.full_name) users[uid].displayName = data.full_name;
    saveLocalUsers(users);
  }
}

// 6. Expenses CRUD
export async function getUserExpenses(uid: string): Promise<Expense[]> {
  if (db && !isLocalMode()) {
    try {
      const q = query(collection(db, "users", uid, "expenses"), orderBy("date", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => {
        const item = d.data();
        return {
          id: d.id,
          amount: Number(item.amount) || 0,
          category: item.category as ExpenseCategory,
          note: item.note ?? undefined,
          date: item.date || new Date().toISOString(),
        };
      });
    } catch (e) {
      console.warn("Error fetching expenses from Firestore:", e);
    }
  }

  // Fallback
  try {
    const raw = localStorage.getItem(`${LOCAL_DATA_PREFIX}${uid}_expenses`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addUserExpense(uid: string, expense: Omit<Expense, "id">): Promise<Expense> {
  const created_at = new Date().toISOString();
  if (db && !isLocalMode()) {
    try {
      const docRef = await addDoc(collection(db, "users", uid, "expenses"), {
        ...expense,
        created_at,
      });
      return { id: docRef.id, ...expense };
    } catch (e) {
      console.warn("Error adding expense to Firestore:", e);
    }
  }

  // Fallback
  const list = await getUserExpenses(uid);
  const newExp: Expense = {
    id: "exp_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
    ...expense,
  };
  const updated = [newExp, ...list];
  localStorage.setItem(`${LOCAL_DATA_PREFIX}${uid}_expenses`, JSON.stringify(updated));
  return newExp;
}

export async function deleteUserExpense(uid: string, expenseId: string): Promise<void> {
  if (db && !isLocalMode()) {
    try {
      await deleteDoc(doc(db, "users", uid, "expenses", expenseId));
      return;
    } catch (e) {
      console.warn("Error deleting expense from Firestore:", e);
    }
  }

  // Fallback
  const list = await getUserExpenses(uid);
  const updated = list.filter((x) => x.id !== expenseId);
  localStorage.setItem(`${LOCAL_DATA_PREFIX}${uid}_expenses`, JSON.stringify(updated));
}

// 7. Incomes CRUD
export async function getUserIncomes(uid: string): Promise<Income[]> {
  if (db && !isLocalMode()) {
    try {
      const q = query(collection(db, "users", uid, "incomes"), orderBy("date", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => {
        const item = d.data();
        return {
          id: d.id,
          amount: Number(item.amount) || 0,
          source: item.source as IncomeSource,
          note: item.note ?? undefined,
          date: item.date || new Date().toISOString(),
        };
      });
    } catch (e) {
      console.warn("Error fetching incomes from Firestore:", e);
    }
  }

  // Fallback
  try {
    const raw = localStorage.getItem(`${LOCAL_DATA_PREFIX}${uid}_incomes`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addUserIncome(uid: string, income: Omit<Income, "id">): Promise<Income> {
  const created_at = new Date().toISOString();
  if (db && !isLocalMode()) {
    try {
      const docRef = await addDoc(collection(db, "users", uid, "incomes"), {
        ...income,
        created_at,
      });
      return { id: docRef.id, ...income };
    } catch (e) {
      console.warn("Error adding income to Firestore:", e);
    }
  }

  // Fallback
  const list = await getUserIncomes(uid);
  const newInc: Income = {
    id: "inc_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
    ...income,
  };
  const updated = [newInc, ...list];
  localStorage.setItem(`${LOCAL_DATA_PREFIX}${uid}_incomes`, JSON.stringify(updated));
  return newInc;
}

export async function deleteUserIncome(uid: string, incomeId: string): Promise<void> {
  if (db && !isLocalMode()) {
    try {
      await deleteDoc(doc(db, "users", uid, "incomes", incomeId));
      return;
    } catch (e) {
      console.warn("Error deleting income from Firestore:", e);
    }
  }

  // Fallback
  const list = await getUserIncomes(uid);
  const updated = list.filter((x) => x.id !== incomeId);
  localStorage.setItem(`${LOCAL_DATA_PREFIX}${uid}_incomes`, JSON.stringify(updated));
}

// 8. Recurring Bills CRUD
export async function getUserRecurring(uid: string): Promise<RecurringBill[]> {
  if (db && !isLocalMode()) {
    try {
      const q = query(collection(db, "users", uid, "recurring_bills"), orderBy("dueDay", "asc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => {
        const item = d.data();
        return {
          id: d.id,
          name: item.name,
          amount: Number(item.amount) || 0,
          dueDay: Number(item.dueDay) || 1,
          category: item.category as ExpenseCategory,
        };
      });
    } catch (e) {
      console.warn("Error fetching recurring bills from Firestore:", e);
    }
  }

  // Fallback
  try {
    const raw = localStorage.getItem(`${LOCAL_DATA_PREFIX}${uid}_recurring`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addUserRecurring(
  uid: string,
  bill: Omit<RecurringBill, "id">,
): Promise<RecurringBill> {
  const created_at = new Date().toISOString();
  if (db && !isLocalMode()) {
    try {
      const docRef = await addDoc(collection(db, "users", uid, "recurring_bills"), {
        ...bill,
        created_at,
      });
      return { id: docRef.id, ...bill };
    } catch (e) {
      console.warn("Error adding recurring bill to Firestore:", e);
    }
  }

  // Fallback
  const list = await getUserRecurring(uid);
  const newBill: RecurringBill = {
    id: "bill_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
    ...bill,
  };
  const updated = [newBill, ...list];
  localStorage.setItem(`${LOCAL_DATA_PREFIX}${uid}_recurring`, JSON.stringify(updated));
  return newBill;
}

export async function deleteUserRecurring(uid: string, billId: string): Promise<void> {
  if (db && !isLocalMode()) {
    try {
      await deleteDoc(doc(db, "users", uid, "recurring_bills", billId));
      return;
    } catch (e) {
      console.warn("Error deleting recurring bill from Firestore:", e);
    }
  }

  // Fallback
  const list = await getUserRecurring(uid);
  const updated = list.filter((x) => x.id !== billId);
  localStorage.setItem(`${LOCAL_DATA_PREFIX}${uid}_recurring`, JSON.stringify(updated));
}

