import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Zap,
  Sparkles,
  Check,
  Disc3,
  Sliders,
  Headphones,
  Music,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  logout,
  subscribeToAuth,
  isFirebaseConfigured,
  getFriendlyAuthErrorMessage,
  type FriendlyAuthError,
  isLocalMode,
  setLocalMode,
  checkFirebaseHealth,
} from "@/lib/firebase";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [university, setUniversity] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingUserEmail, setExistingUserEmail] = useState<string | null>(null);
  const [authError, setAuthError] = useState<FriendlyAuthError | null>(null);
  const [localModeActive, setLocalModeActive] = useState<boolean>(() => isLocalMode());
  const [cloudStatus, setCloudStatus] = useState<
    "checking" | "ready" | "needs_get_started" | "error"
  >("checking");
  const [checkingCloud, setCheckingCloud] = useState(false);

  const refreshCloudStatus = async () => {
    setCheckingCloud(true);
    const health = await checkFirebaseHealth();
    setCloudStatus(health.status);
    setCheckingCloud(false);
    if (health.status === "ready") {
      toast.success("Firebase Cloud is active and ready!");
    } else if (health.status === "needs_get_started") {
      toast.info("Firebase needs 'Get started' clicked in the console.");
    }
  };

  useEffect(() => {
    checkFirebaseHealth().then((h) => setCloudStatus(h.status));
  }, []);

  useEffect(() => {
    const unsub = subscribeToAuth((user) => {
      if (user?.email) {
        setExistingUserEmail(user.email);
      } else {
        setExistingUserEmail(null);
      }
    });
    return () => unsub();
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAuthError(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("pp.signed_out");
    }
    try {
      await signInWithGoogle();
      toast.success("Welcome to PocketPilot!");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      const friendly = getFriendlyAuthErrorMessage(err);
      setAuthError(friendly);
      toast.error(friendly.title);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToLocalAndRetry = async () => {
    setLocalMode(true);
    setLocalModeActive(true);
    setAuthError(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        await signInWithEmail(email.trim(), password.trim());
        toast.success("Welcome back to PocketPilot (Local Real-Data Mode)!");
        navigate({ to: "/dashboard" });
      } else {
        const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || "Student Pilot";
        await signUpWithEmail(
          email.trim(),
          password.trim(),
          fullName,
          university.trim() || undefined,
        );
        toast.success("Account created! (Local Real-Data Mode)");
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      const friendly = getFriendlyAuthErrorMessage(err);
      setAuthError(friendly);
      toast.error(friendly.title);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in your email and password");
      return;
    }
    if (mode === "signup" && !agreed) {
      toast.error("Please agree to the Terms of Service");
      return;
    }

    setLoading(true);
    setAuthError(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("pp.signed_out");
    }

    try {
      if (mode === "signin") {
        await signInWithEmail(email.trim(), password.trim());
        toast.success("Welcome back to PocketPilot!");
        navigate({ to: "/dashboard" });
      } else {
        // Sign Up with Firebase
        const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || "Student Pilot";
        await signUpWithEmail(
          email.trim(),
          password.trim(),
          fullName,
          university.trim() || undefined,
        );
        toast.success("Account created! Welcome to PocketPilot");
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      const friendly = getFriendlyAuthErrorMessage(err);
      setAuthError(friendly);
      toast.error(friendly.title);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#1a0633] via-[#2a0e50] to-[#0c0318] text-white selection:bg-purple-500 selection:text-white flex items-center justify-center p-3 sm:p-6 lg:p-10">
      
      {/* Background Neon Spotlights and Ambience */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-purple-600/20 blur-[130px]" />
      <div className="pointer-events-none absolute right-0 top-1/4 h-[700px] w-[700px] rounded-full bg-fuchsia-600/20 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />

      {/* Main 2-Column Split Container */}
      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-8 lg:flex-row lg:items-center">
        
        {/* ============================================================== */}
        {/* LEFT COLUMN: THE WHITE FLOATING AUTH CARD                      */}
        {/* ============================================================== */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-20 w-full max-w-[480px] shrink-0 rounded-[32px] bg-white p-7 sm:p-9 text-neutral-900 shadow-[0_25px_80px_rgba(0,0,0,0.5)] ring-1 ring-black/5"
        >
          {/* Back to Home Link */}
          <div className="mb-4 flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 transition-colors hover:text-purple-600"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to website
            </Link>

            {/* Toggle Mode Pills */}
            <div className="flex rounded-full bg-neutral-100 p-0.5 text-xs font-medium text-neutral-600">
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`rounded-full px-3 py-1 transition-all ${
                  mode === "signup"
                    ? "bg-white font-semibold text-neutral-950 shadow-sm"
                    : "hover:text-neutral-950"
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={`rounded-full px-3 py-1 transition-all ${
                  mode === "signin"
                    ? "bg-white font-semibold text-neutral-950 shadow-sm"
                    : "hover:text-neutral-950"
                }`}
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Top Logo / Mascot Badge matching reference */}
          <div className="mb-4 flex justify-center">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-[#7c3aed] via-[#a855f7] to-[#c084fc] p-1 shadow-lg shadow-purple-500/30">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-[#18082e] text-white">
                {/* PocketPilot mascot origami pilot emblem */}
                <svg viewBox="0 0 32 32" className="h-8 w-8 fill-current text-purple-300">
                  <path d="M16 4 L28 24 L16 19 L4 24 Z" />
                </svg>
              </div>
              <Sparkles className="absolute -right-1 -top-1 h-5 w-5 text-amber-300 drop-shadow" />
            </div>
          </div>

          {/* Header Texts */}
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-950">
              {mode === "signup" ? "Hey There, Pocket Pilot!" : "Welcome Back, Pilot!"}
            </h1>
            <p className="mt-1 text-xs text-neutral-500">
              {mode === "signup"
                ? "Log in and vibe with the chillest money tracker on campus."
                : "Jump back in and check on your student savings beats."}
            </p>
          </div>

          {/* Backend Mode Indicator & Switcher */}
          <div className="mt-4 rounded-2xl border border-neutral-100 bg-neutral-50/90 p-2.5 text-xs shadow-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium text-neutral-700">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    localModeActive
                      ? "bg-amber-500"
                      : cloudStatus === "ready"
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-rose-500"
                  }`}
                />
                Mode:{" "}
                <strong
                  className={
                    localModeActive
                      ? "text-amber-800"
                      : cloudStatus === "ready"
                      ? "text-emerald-800"
                      : "text-rose-800"
                  }
                >
                  {localModeActive
                    ? "Local Real Data"
                    : cloudStatus === "ready"
                    ? "Firebase Cloud (Active)"
                    : "Firebase Cloud (Pending Setup)"}
                </strong>
              </span>

              <button
                type="button"
                onClick={() => {
                  const next = !localModeActive;
                  setLocalMode(next);
                  setLocalModeActive(next);
                  setAuthError(null);
                  toast.info(next ? "Switched to Local Real Data" : "Switched to Firebase Cloud");
                }}
                className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-purple-700 shadow-sm border border-neutral-200 hover:bg-neutral-50 transition"
              >
                {localModeActive ? "Switch to Firebase Cloud" : "Switch to Local Mode"}
              </button>
            </div>

            {!localModeActive && cloudStatus === "needs_get_started" && (
              <div className="mt-2.5 pt-2 border-t border-neutral-200/60 flex items-center justify-between text-[11px]">
                <span className="text-neutral-500">
                  Firebase project needs <strong>Get started</strong> clicked.
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href="https://console.firebase.google.com/project/pocket-pilot-fd207/authentication"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-purple-600 hover:underline inline-flex items-center gap-0.5"
                  >
                    Open Console ↗
                  </a>
                  <button
                    type="button"
                    onClick={refreshCloudStatus}
                    disabled={checkingCloud}
                    className="text-neutral-600 underline hover:text-neutral-900"
                  >
                    {checkingCloud ? "Checking..." : "Re-check"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active Session Notification if detected */}
          {existingUserEmail && (
            <div className="mt-4 rounded-2xl border border-purple-200 bg-purple-50/70 p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Active session:</span>
                <span className="font-semibold text-purple-900 truncate max-w-[170px]">
                  {existingUserEmail}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate({ to: "/dashboard" })}
                  className="rounded-lg bg-purple-600 px-3 py-1 font-semibold text-white shadow-sm hover:bg-purple-700"
                >
                  Go to Dashboard →
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    setExistingUserEmail(null);
                    toast.info("Signed out");
                  }}
                  className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1 text-neutral-600 hover:bg-neutral-50"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Error Banner with Direct Solution & 1-Click Fallback */}
          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-950 shadow-sm"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                <div className="flex-1 space-y-1.5">
                  <div className="font-bold text-rose-900">{authError.title}</div>
                  <p className="leading-relaxed text-rose-800">{authError.message}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2 pt-1">
                    {authError.actionUrl && (
                      <a
                        href={authError.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 font-semibold text-white shadow-sm hover:bg-rose-700 transition"
                      >
                        {authError.actionText || "Open Console ↗"}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={handleSwitchToLocalAndRetry}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-white px-3 py-1.5 font-semibold text-rose-800 shadow-sm hover:bg-rose-100/60 transition"
                    >
                      Continue in Local Mode →
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            {/* First & Last Name (Sign Up only) */}
            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-xl bg-[#f4f5f7] px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:bg-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-xl bg-[#f4f5f7] px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:bg-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <input
                type="email"
                required
                placeholder="Input your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-[#f4f5f7] px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:bg-white focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Password Field with Eye Toggle */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Input your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-[#f4f5f7] px-3.5 py-2.5 pr-10 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:bg-white focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* University / Country (Sign Up only) */}
            {mode === "signup" && (
              <div>
                <input
                  type="text"
                  placeholder="University / Country"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full rounded-xl bg-[#f4f5f7] px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:bg-white focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            {/* Terms of Service Checkbox (Sign Up only) */}
            {mode === "signup" && (
              <label className="flex items-start gap-2 pt-1 text-[11px] text-neutral-500 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                />
                <span>
                  I agree to the{" "}
                  <span className="font-semibold underline text-neutral-800">
                    Terms of service
                  </span>{" "}
                  and{" "}
                  <span className="font-semibold underline text-neutral-800">
                    Privacy Policies
                  </span>{" "}
                  of PocketPilot
                </span>
              </label>
            )}

            {/* Gradient Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#9333ea] via-[#7c3aed] to-[#6366f1] py-3 text-xs font-semibold text-white shadow-md shadow-purple-500/25 transition-all duration-200 hover:opacity-95 hover:shadow-lg active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === "signup" ? (
                "Sign Up"
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="h-px w-full bg-neutral-100" />
            <span className="absolute bg-white px-3 text-[10px] text-neutral-400 uppercase tracking-wider">
              or continue with
            </span>
          </div>

          {/* Social Auth Buttons */}
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition active:scale-[0.99]"
            >
              {/* Google G icon */}
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                />
              </svg>
              Google
            </button>

            <button
              type="button"
              onClick={() => {
                toast.info("Apple Sign-In is enabled when Apple OAuth is configured in Firebase console.");
              }}
              className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition active:scale-[0.99]"
            >
              {/* Apple icon */}
              <svg className="h-3.5 w-3.5 fill-current text-neutral-900" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.78 1.06-1.85.94-2.94-.92.04-2.02.61-2.67 1.39-.58.67-1.08 1.76-.95 2.83 1.03.08 2.06-.5 2.68-1.28Z" />
              </svg>
              Apple
            </button>
          </div>

          {/* Footer Switch */}
          <div className="mt-4 text-center text-xs text-neutral-500">
            {mode === "signup" ? (
              <>
                Do have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="font-bold text-neutral-950 underline hover:text-purple-600"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="font-bold text-neutral-950 underline hover:text-purple-600"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: THE POCKETPILOT DJ TURNTABLE SCENE               */}
        {/* ============================================================== */}
        <div className="relative flex flex-1 items-center justify-center p-4 lg:p-6 select-none overflow-visible">
          
          {/* Main Visual Container */}
          <div className="relative flex w-full max-w-[620px] flex-col items-center justify-center">

            {/* 3D FLOATING GOLD COINS RAINING & VIBING (matching image) */}
            
            {/* Top Left Floating Gold Coin */}
            <motion.div
              animate={{ y: [-8, 8, -8], rotate: [-10, -5, -10] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-12 left-4 z-10 sm:left-12"
            >
              <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full border-[5px] border-amber-300/80 bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-1 shadow-[0_15px_40px_rgba(245,158,11,0.5)]">
                <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-dashed border-amber-600/40 bg-gradient-to-b from-amber-300 to-amber-500 shadow-inner">
                  {/* Coin Face Emblem */}
                  <div className="flex flex-col items-center">
                    <span className="font-display text-2xl sm:text-3xl font-black text-amber-950/80">
                      ৳
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-amber-900/70">
                      ALLOWANCE
                    </span>
                  </div>
                </div>
                <div className="absolute top-2 right-4 h-3 w-3 rounded-full bg-white/70 blur-[1px]" />
              </div>
            </motion.div>

            {/* Top Right Big Floating Gold Coin */}
            <motion.div
              animate={{ y: [10, -10, 10], rotate: [15, 20, 15] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 right-2 z-10 sm:right-6"
            >
              <div className="relative flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-full border-[5px] border-amber-300/80 bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-1 shadow-[0_20px_50px_rgba(245,158,11,0.6)]">
                <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-dashed border-amber-600/40 bg-gradient-to-b from-amber-300 to-amber-500 shadow-inner">
                  <div className="flex flex-col items-center">
                    <span className="font-display text-3xl sm:text-4xl font-black text-amber-950/80">
                      ₿
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-amber-900/70">
                      SAVINGS
                    </span>
                  </div>
                </div>
                <div className="absolute top-3 left-4 h-4 w-4 rounded-full bg-white/80 blur-[1px]" />
              </div>
            </motion.div>

            {/* Mid-Left Medium Floating Gold Coin */}
            <motion.div
              animate={{ y: [6, -6, 6], scale: [1, 1.05, 1] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-32 -left-6 z-10 sm:left-2"
            >
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-[3px] border-amber-300/80 bg-gradient-to-tr from-amber-500 to-yellow-200 shadow-[0_10px_30px_rgba(245,158,11,0.4)]">
                <span className="font-display text-lg sm:text-xl font-black text-amber-950">
                  $
                </span>
              </div>
            </motion.div>

            {/* Mid-Right Medium Floating Gold Coin */}
            <motion.div
              animate={{ y: [-8, 8, -8], rotate: [-8, 8, -8] }}
              transition={{ duration: 5.1, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-44 -right-4 z-10 sm:right-2"
            >
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-[3px] border-amber-300/80 bg-gradient-to-tr from-amber-500 to-yellow-200 shadow-[0_10px_30px_rgba(245,158,11,0.4)]">
                <span className="font-display text-base font-black text-amber-950">
                  🎓
                </span>
              </div>
            </motion.div>

            {/* Background blurred depth coins */}
            <div className="pointer-events-none absolute -top-16 left-1/3 h-12 w-12 rounded-full bg-amber-400/40 blur-[4px]" />
            <div className="pointer-events-none absolute top-16 right-1/4 h-14 w-14 rounded-full bg-amber-400/40 blur-[5px]" />
            <div className="pointer-events-none absolute bottom-20 -right-6 h-16 w-16 rounded-full bg-amber-400/40 blur-[6px]" />

            {/* ============================================================== */}
            {/* THE DJ MASCOT CHARACTER & TURNTABLE SETUP                      */}
            {/* ============================================================== */}
            <div className="relative z-20 flex w-full flex-col items-center">
              
              {/* Mascot Head & Torso */}
              <motion.div
                animate={{ y: [-3, 3, -3] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                className="relative flex flex-col items-center"
              >
                {/* Large Colorful DJ Over-Ear Headphones */}
                <div className="absolute -top-3 z-30 flex w-[230px] sm:w-[260px] items-center justify-between">
                  {/* Left Headphone Ear Cup */}
                  <div className="flex h-16 w-12 sm:h-18 sm:w-14 items-center justify-center rounded-2xl border-2 border-cyan-300 bg-gradient-to-r from-cyan-400 to-blue-600 shadow-[0_0_20px_rgba(6,182,212,0.6)]">
                    <div className="h-10 w-4 rounded-lg bg-pink-500" />
                  </div>
                  {/* Headphone Bridge Arc */}
                  <div className="h-5 flex-1 -mx-2 -mt-10 rounded-t-[50px] border-t-[8px] border-neutral-900 shadow-md" />
                  {/* Right Headphone Ear Cup */}
                  <div className="flex h-16 w-12 sm:h-18 sm:w-14 items-center justify-center rounded-2xl border-2 border-cyan-300 bg-gradient-to-l from-cyan-400 to-blue-600 shadow-[0_0_20px_rgba(6,182,212,0.6)]">
                    <div className="h-10 w-4 rounded-lg bg-pink-500" />
                  </div>
                </div>

                {/* Mascot Face (Capy / Pilot Cool Character) */}
                <div className="relative mt-2 flex h-40 w-40 sm:h-44 sm:w-44 items-center justify-center rounded-[48px] bg-gradient-to-b from-[#b37d4e] to-[#8c5a2b] shadow-2xl">
                  {/* Snout */}
                  <div className="absolute -bottom-1 h-24 w-28 rounded-[36px] bg-[#2e1d10] shadow-inner flex flex-col items-center justify-end pb-3">
                    {/* Nostrils */}
                    <div className="flex gap-4">
                      <div className="h-2 w-3 rounded-full bg-black/60" />
                      <div className="h-2 w-3 rounded-full bg-black/60" />
                    </div>
                  </div>

                  {/* Eyes (Cool, confident half-lidded eyes from image) */}
                  <div className="absolute top-12 flex w-24 justify-between px-2">
                    {/* Left Eye */}
                    <div className="flex flex-col items-center">
                      <div className="h-1.5 w-6 rounded-full bg-[#1b1007] rotate-[-5deg]" />
                      <div className="mt-1 h-3.5 w-5 overflow-hidden rounded-full bg-white relative">
                        <div className="absolute top-0 right-1 h-3 w-3 rounded-full bg-black" />
                      </div>
                    </div>
                    {/* Right Eye */}
                    <div className="flex flex-col items-center">
                      <div className="h-1.5 w-6 rounded-full bg-[#1b1007] rotate-[5deg]" />
                      <div className="mt-1 h-3.5 w-5 overflow-hidden rounded-full bg-white relative">
                        <div className="absolute top-0 left-1 h-3 w-3 rounded-full bg-black" />
                      </div>
                    </div>
                  </div>

                  {/* Ears */}
                  <div className="absolute -top-3 left-6 h-8 w-6 rounded-full bg-[#7a481c] rotate-[-20deg]" />
                  <div className="absolute -top-3 right-6 h-8 w-6 rounded-full bg-[#7a481c] rotate-[20deg]" />
                </div>

                {/* Varsity Bomber Jacket Torso */}
                <div className="relative -mt-6 z-10 flex h-24 w-52 sm:w-60 items-center justify-center rounded-t-[40px] bg-gradient-to-b from-[#e11d48] to-[#9f1239] border-t-4 border-cyan-400 shadow-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-black tracking-widest text-white">
                      POCKETPILOT
                    </span>
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  </div>
                  {/* White jacket sleeves */}
                  <div className="absolute -left-4 top-2 h-20 w-8 rounded-full bg-neutral-100 rotate-[-15deg] shadow-md" />
                  <div className="absolute -right-4 top-2 h-20 w-8 rounded-full bg-neutral-100 rotate-[15deg] shadow-md" />
                </div>
              </motion.div>

              {/* ============================================================== */}
              {/* THE DJ TURNTABLE MIXER CONSOLE DECK                            */}
              {/* ============================================================== */}
              <div className="relative -mt-4 w-full rounded-3xl border-2 border-purple-400/40 bg-gradient-to-b from-[#3b0764] via-[#240046] to-[#10002b] p-4 sm:p-5 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-md">
                
                {/* Console Deck Top Bevel */}
                <div className="flex items-center justify-between border-b border-purple-500/20 pb-2.5 text-[10px] uppercase font-bold tracking-wider text-purple-300">
                  <span className="flex items-center gap-1.5">
                    <Disc3 className="h-3.5 w-3.5 text-pink-400 animate-spin" />
                    Allowance Deck A
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 font-mono">
                    ● 128 BPM · BUDGET MASTER
                  </span>
                  <span className="flex items-center gap-1.5">
                    Savings Deck B
                    <Disc3 className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
                  </span>
                </div>

                {/* Turntables & Mixer Grid */}
                <div className="mt-4 grid grid-cols-12 items-center gap-3">
                  
                  {/* Left Turntable: Golden Coin Record A */}
                  <div className="col-span-4 flex flex-col items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full border-4 border-amber-300 bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 shadow-[0_0_25px_rgba(245,158,11,0.4)] cursor-pointer"
                    >
                      {/* Vinyl Grooves */}
                      <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-2 border-dashed border-amber-800/40 bg-amber-500/30">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-950 text-amber-300 font-bold text-xs shadow-inner">
                          ৳
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Center Sound Mixer & Sliders */}
                  <div className="col-span-4 flex flex-col items-center justify-center rounded-2xl bg-black/40 p-2.5 border border-purple-500/30">
                    {/* Equalizer Visualizer Bars */}
                    <div className="flex h-10 items-end gap-1 mb-2">
                      {[40, 75, 95, 60, 85, 50, 90, 70].map((h, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: [`${h * 0.4}%`, `${h}%`, `${h * 0.5}%`] }}
                          transition={{ duration: 0.6 + i * 0.1, repeat: Infinity, ease: "easeInOut" }}
                          className="w-1.5 rounded-full bg-gradient-to-t from-emerald-400 via-yellow-400 to-pink-500"
                        />
                      ))}
                    </div>

                    {/* Faders / Knobs */}
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-2 rounded-full bg-neutral-800 relative">
                          <div className="absolute top-2 -left-1 h-3 w-4 rounded bg-purple-400 shadow" />
                        </div>
                        <span className="text-[8px] text-purple-300 mt-1">VOL</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-2 rounded-full bg-neutral-800 relative">
                          <div className="absolute top-4 -left-1 h-3 w-4 rounded bg-cyan-400 shadow" />
                        </div>
                        <span className="text-[8px] text-cyan-300 mt-1">BASS</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-2 rounded-full bg-neutral-800 relative">
                          <div className="absolute top-1 -left-1 h-3 w-4 rounded bg-pink-400 shadow" />
                        </div>
                        <span className="text-[8px] text-pink-300 mt-1">SAVE</span>
                      </div>
                    </div>

                    {/* Crossfader */}
                    <div className="mt-2.5 w-full h-3 rounded-full bg-neutral-800 relative px-1 flex items-center">
                      <div className="h-4 w-5 rounded bg-white shadow-md mx-auto" />
                    </div>
                  </div>

                  {/* Right Turntable: Golden Coin Record B */}
                  <div className="col-span-4 flex flex-col items-center justify-center">
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
                      className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full border-4 border-amber-300 bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 shadow-[0_0_25px_rgba(245,158,11,0.4)] cursor-pointer"
                    >
                      <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-2 border-dashed border-amber-800/40 bg-amber-500/30">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-950 text-amber-300 font-bold text-xs shadow-inner">
                          ₿
                        </div>
                      </div>
                    </motion.div>
                  </div>

                </div>

                {/* Bottom DJ Deck Glow Bar */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-purple-300/80 px-2 pt-2 border-t border-purple-500/20">
                  <div className="flex items-center gap-1.5">
                    <Headphones className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Live Campus Cashflow Track</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-emerald-300 font-medium">100% Free Forever</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
