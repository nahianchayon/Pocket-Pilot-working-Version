import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { subscribeToAuth } from "@/lib/firebase";
import {
  Wallet,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Sparkles,
  PieChart as PieIcon,
  Receipt,
  CheckCircle2,
  Lock,
  ChevronRight,
  Calculator,
  Coins,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PocketPilot — Finance Made Simple for Students" },
      {
        name: "description",
        content:
          "PocketPilot is the smart personal finance and expense tracker engineered for university students. Track allowances, split bills, and hit your savings goals effortlessly.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const [allowance, setAllowance] = useState(25000);
  const [estimatedSpend, setEstimatedSpend] = useState(17500);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsub = subscribeToAuth((user) => {
      setIsAuthenticated(Boolean(user));
    });
    return () => unsub();
  }, []);

  const potentialSavings = Math.max(0, allowance - estimatedSpend);
  const healthScore = Math.max(
    10,
    Math.min(100, Math.round(((allowance - estimatedSpend) / allowance) * 100 * 0.7 + 30)),
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-neutral-900 selection:bg-blue-600 selection:text-white px-3 py-4 sm:px-6 sm:py-8 lg:px-10 lg:py-12">
      {/* Central Hero Card Container matching the uploaded design */}
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] sm:rounded-[2.75rem] lg:rounded-[3.25rem] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.45)] ring-1 ring-black/5">
        
        {/* Top Navigation Bar */}
        <header className="flex items-center justify-between px-6 py-6 sm:px-10 lg:px-14">
          {/* Brand Logo */}
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 text-white transition-transform duration-300 group-hover:scale-105">
              {/* Minimalist geometric mark matching reference */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-neutral-950">
              PocketPilot
            </span>
          </Link>

          {/* Right Action: Login / Sign Up Button */}
          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center rounded-full bg-neutral-950 px-6 py-2.5 text-xs sm:text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-neutral-800 hover:scale-[1.02] active:scale-[0.98]"
            >
              Login / Sign Up
            </Link>
          </div>
        </header>

        {/* Hero Section: 2 Columns */}
        <section className="px-6 pb-12 pt-2 sm:px-10 lg:px-14 lg:pb-20">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            
            {/* Left Column: Blue 3D Visual Box */}
            <div className="order-2 lg:order-1 lg:col-span-6">
              <div className="relative mx-auto flex min-h-[480px] sm:min-h-[580px] lg:min-h-[620px] w-full items-center justify-center overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-b from-[#8fc1fd] via-[#3a83ee] to-[#1a64e4] p-6 sm:p-10 shadow-[0_20px_50px_rgba(26,100,228,0.35)]">
                
                {/* Background Ambient Glows and Decorative Particles */}
                <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-blue-900/30 blur-3xl" />
                <div className="pointer-events-none absolute left-8 top-12 h-2.5 w-2.5 rounded-full bg-white/70" />
                <div className="pointer-events-none absolute right-12 top-20 h-2 w-2 rounded-full bg-blue-200/80" />
                <div className="pointer-events-none absolute bottom-16 left-12 h-3 w-3 rounded-full bg-white/50" />

                {/* 3D Tilted Smartphone Mockup */}
                <motion.div
                  initial={{ opacity: 0, y: 30, rotate: -7 }}
                  animate={{ opacity: 1, y: 0, rotate: -7 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  whileHover={{ rotate: -5, scale: 1.02 }}
                  className="relative z-10 w-[240px] sm:w-[270px] shrink-0 -translate-x-3 sm:-translate-x-6 select-none"
                >
                  {/* Phone Outer Chassis with Glass Bezel */}
                  <div className="relative rounded-[42px] border-[5px] border-neutral-900 bg-[#0e121a] p-3 shadow-[0_25px_60px_rgba(0,18,51,0.6)] ring-1 ring-white/20">
                    
                    {/* Screen Container */}
                    <div className="relative flex h-[460px] sm:h-[500px] flex-col overflow-hidden rounded-[32px] bg-gradient-to-b from-[#0c1017] via-[#111827] to-[#0a0d14] p-4 text-white">
                      
                      {/* Top Speaker / Dynamic Island */}
                      <div className="mx-auto mb-3 flex h-4 w-20 items-center justify-center rounded-full bg-neutral-900">
                        <div className="h-2 w-2 rounded-full bg-neutral-950 ring-1 ring-neutral-800" />
                      </div>

                      {/* Phone Screen Header: Payment System / PocketPilot */}
                      <div className="mb-4 text-left">
                        <div className="text-[10px] uppercase tracking-wider text-blue-300 font-semibold">
                          PocketPilot
                        </div>
                        <h3 className="font-display text-base sm:text-lg font-bold leading-tight text-white">
                          Payment System
                        </h3>
                      </div>

                      {/* Stacked Digital Wallet Cards */}
                      <div className="relative mt-2 flex flex-1 flex-col items-center">
                        {/* Card 1 (Back / Top Card - Minimal White) */}
                        <div className="absolute top-0 z-10 h-24 w-[92%] rounded-2xl bg-white p-3 text-neutral-900 shadow-md transition-transform hover:-translate-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                              Allowance Pass
                            </span>
                            <Lock className="h-3.5 w-3.5 text-neutral-400" />
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="h-4 w-7 rounded bg-neutral-200" />
                            <span className="font-mono text-xs font-bold">৳ 25,000</span>
                          </div>
                        </div>

                        {/* Card 2 (Blue Card) */}
                        <div className="absolute top-12 z-20 h-24 w-[95%] rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 p-3 text-white shadow-lg transition-transform hover:-translate-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-medium tracking-wider text-blue-100">
                              Campus Card
                            </span>
                            <div className="h-3 w-3 rounded-full bg-white/40" />
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="font-mono text-[11px] text-blue-100">•••• 8421</span>
                            <span className="text-[10px] font-bold">STUDENT</span>
                          </div>
                        </div>

                        {/* Card 3 (Pastel Lilac / Abstract Graphic Card) */}
                        <div className="absolute top-24 z-30 h-26 w-[97%] rounded-2xl bg-gradient-to-tr from-[#fad0c4] via-[#ffd1ff] to-[#fbc2eb] p-3 text-neutral-900 shadow-xl transition-transform hover:-translate-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-neutral-700">
                              Savings Vault
                            </span>
                            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900/10">
                              <Lock className="h-2.5 w-2.5 text-neutral-800" />
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <span className="font-mono text-[11px] font-bold text-neutral-800">
                              Goal: 94% Achieved
                            </span>
                          </div>
                        </div>

                        {/* Card 4 (Gold & Dark Waves Foreground Card matching image) */}
                        <div className="absolute top-36 z-40 h-28 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#f6d365] via-[#fda085] to-[#f5af19] p-3.5 text-neutral-900 shadow-2xl transition-transform hover:-translate-y-1">
                          {/* Dark wavy fluid graphics in card */}
                          <div className="pointer-events-none absolute inset-0 opacity-25">
                            <svg viewBox="0 0 200 120" className="h-full w-full">
                              <path
                                d="M0,40 C50,10 80,80 150,30 C180,10 200,60 200,60 L200,120 L0,120 Z"
                                fill="#000"
                              />
                            </svg>
                          </div>
                          <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <div className="h-4 w-4 rounded-full bg-neutral-950" />
                              <span className="text-[11px] font-bold text-neutral-950">
                                PocketPilot Black
                              </span>
                            </div>
                            <div className="h-3 w-6 rounded bg-neutral-900/20" />
                          </div>
                          <div className="relative z-10 mt-5 flex items-center justify-between">
                            <span className="font-mono text-xs font-extrabold text-neutral-950">
                              ৳ 12,450.00
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-900/80">
                              Active
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Action Pill on Phone Bottom */}
                      <div className="mt-auto pt-2">
                        <div className="flex items-center justify-center gap-1 rounded-xl bg-white/10 py-1.5 text-center text-[10px] font-medium text-white/90 backdrop-blur-sm">
                          <Zap className="h-3 w-3 text-amber-300" />
                          Instant Budget Sync
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* ============================================================== */}
                {/* 3D FLOATING TOKENS & BADGES MATCHING THE REFERENCE IMAGE       */}
                {/* ============================================================== */}

                {/* Token 1: Floating Green Circle with White Upward Arrow (Top Left) */}
                <motion.div
                  animate={{ y: [-6, 6, -6], rotate: [0, 4, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-6 top-10 sm:left-10 sm:top-14 z-20"
                >
                  <div className="group relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-tr from-[#024523] via-[#05964f] to-[#10b981] p-1 shadow-[0_12px_30px_rgba(5,150,79,0.5)] ring-2 ring-emerald-300/40">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#0b8043] to-[#044c26] shadow-inner">
                      {/* Chunky white diagonal arrow */}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-7 w-7 sm:h-9 sm:w-9 drop-shadow-md"
                      >
                        <line x1="7" y1="17" x2="17" y2="7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                    </div>
                  </div>
                </motion.div>

                {/* Token 2: Silver/White Metallic Floating Ring Coin (Top Center/Right) */}
                <motion.div
                  animate={{ y: [6, -6, 6], rotate: [0, -5, 0] }}
                  transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute right-28 top-8 sm:right-36 sm:top-12 z-20 hidden sm:block"
                >
                  <div className="h-14 w-20 rounded-full border-[5px] border-neutral-100/90 bg-gradient-to-b from-neutral-200/40 via-white/20 to-neutral-400/40 shadow-[0_10px_25px_rgba(0,0,0,0.2)] backdrop-blur-sm -rotate-45" />
                </motion.div>

                {/* Token 3: Terrazzo Ceramic Plate with Blue Checkmark (Center Right) */}
                <motion.div
                  animate={{ y: [-8, 8, -8], scale: [1, 1.02, 1] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -right-6 top-32 sm:right-4 sm:top-36 z-30"
                >
                  <div className="relative flex h-28 w-28 sm:h-36 sm:w-36 items-center justify-center rounded-full border-4 border-white/60 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                    {/* Terrazzo speckles pattern background */}
                    <div
                      className="absolute inset-0 rounded-full opacity-70"
                      style={{
                        backgroundImage: `radial-gradient(#059669 1.5px, transparent 1.5px), radial-gradient(#2563eb 1.5px, transparent 1.5px)`,
                        backgroundSize: "12px 12px, 16px 16px",
                        backgroundPosition: "0 0, 8px 8px",
                      }}
                    />
                    {/* Emerald center ring */}
                    <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 shadow-inner">
                      {/* Blue badge with checkmark */}
                      <div className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#1d4ed8] shadow-md">
                        <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Token 4: Metallic Dark Chrome Coin with Currency Symbol ($ / ৳) */}
                <motion.div
                  animate={{ y: [8, -8, 8], rotate: [0, 8, 0] }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute right-1 top-72 sm:right-8 sm:top-64 z-20"
                >
                  <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-[3px] border-neutral-400/60 bg-gradient-to-b from-[#4b5563] via-[#1f2937] to-[#111827] shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
                    <span className="font-display text-xl sm:text-2xl font-black text-white/90 drop-shadow">
                      ৳
                    </span>
                  </div>
                </motion.div>

                {/* Token 5: Navy/Slate Coin with Bitcoin / Pocket Token (Bottom Right) */}
                <motion.div
                  animate={{ y: [-5, 7, -5], rotate: [0, -6, 0] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute right-12 bottom-8 sm:right-24 sm:bottom-12 z-20"
                >
                  <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full border-[3px] border-blue-400/40 bg-gradient-to-tr from-[#172554] via-[#1e3a8a] to-[#2563eb] shadow-[0_18px_40px_rgba(15,23,42,0.6)]">
                    <span className="font-display text-2xl sm:text-3xl font-extrabold italic text-white drop-shadow">
                      ₿
                    </span>
                  </div>
                </motion.div>

                {/* Token 6: Yellow Moon / Semicircle Slice (Middle) */}
                <motion.div
                  animate={{ scale: [1, 1.05, 1], y: [4, -4, 4] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute right-24 top-60 sm:right-32 sm:top-56 z-10"
                >
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-[0_10px_25px_rgba(245,158,11,0.5)]" />
                </motion.div>

                {/* Token 7: Jade Gem Ring (Bottom Center Right) */}
                <motion.div
                  animate={{ y: [-4, 6, -4], rotate: [10, -10, 10] }}
                  transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute right-4 bottom-32 sm:right-10 sm:bottom-36 z-20 hidden sm:block"
                >
                  <div className="h-8 w-8 rounded-full border-4 border-emerald-300/80 bg-emerald-950/20 shadow-[0_5px_15px_rgba(16,185,129,0.4)] backdrop-blur-sm" />
                </motion.div>

              </div>
            </div>

            {/* Right Column: Hero Typography & Key Metrics */}
            <div className="order-1 lg:order-2 lg:col-span-6 lg:pl-4">
              
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/70 px-3.5 py-1 text-xs font-semibold text-blue-700">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                Next-Gen Student Expense Platform
              </div>

              {/* Headline matching image typography */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[58px] font-bold tracking-tight text-neutral-950 leading-[1.08]">
                Finance made <br />
                simple for <br />
                students
              </h1>

              {/* Subtext description */}
              <p className="mt-6 max-w-lg text-base sm:text-lg leading-relaxed text-neutral-500">
                Whether you're launching your campus life, managing allowances,
                or simply seeking a smarter way to handle your money, PocketPilot
                is here to help you stay ahead.
              </p>

              {/* Stats Section with Divider matching image */}
              <div className="mt-10 flex items-center gap-8 sm:gap-12 border-t border-neutral-100 pt-8">
                
                {/* Metric 1 */}
                <div>
                  <div className="mb-1.5 flex h-4 w-4 items-center justify-center">
                    {/* Small coral indicator dot/tag from image */}
                    <div className="h-2.5 w-3 rounded-t-sm bg-rose-500/80" />
                  </div>
                  <div className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950">
                    6.2k
                  </div>
                  <div className="mt-1 text-xs sm:text-sm font-medium text-neutral-500">
                    Students supported
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="h-14 w-px bg-neutral-200" />

                {/* Metric 2 */}
                <div>
                  <div className="mb-1.5 flex h-4 w-4 items-center justify-center">
                    {/* Small golden indicator from image */}
                    <div className="h-2.5 w-3 rounded-full bg-amber-400" />
                  </div>
                  <div className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950">
                    567
                  </div>
                  <div className="mt-1 text-xs sm:text-sm font-medium text-neutral-500">
                    Successful savings goals
                  </div>
                </div>

              </div>

              {/* CTAs */}
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(37,99,235,0.35)] transition-all duration-200 hover:from-blue-500 hover:to-indigo-500 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Start Tracking Free
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href="#simulator"
                  className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-6 py-3.5 text-sm font-semibold text-neutral-800 transition-all hover:bg-neutral-100"
                >
                  <Calculator className="h-4 w-4 text-neutral-500" />
                  Try Savings Calculator
                </a>
              </div>

              {/* Trust Tag */}
              <div className="mt-8 flex items-center gap-4 text-xs text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  No credit card required
                </span>
                <span>•</span>
                <span>Works on Web & Android</span>
                <span>•</span>
                <span>100% Free for Students</span>
              </div>

            </div>

          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section id="features" className="border-t border-neutral-100 bg-neutral-50/60 px-6 py-16 sm:px-10 lg:px-14">
          <div className="mb-12 max-w-2xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
              Engineered for student life. Simple by design.
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              Traditional banking apps are noisy and complicated. PocketPilot focuses on what university students actually need to survive the semester.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            
            <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Receipt className="h-6 w-6" />
              </div>
              <h3 className="font-display text-base font-bold text-neutral-900">
                Instant Expense Logs
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                Track every canteen lunch, rickshaw fare, book, and printout in seconds with smart category presets.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="font-display text-base font-bold text-neutral-900">
                Allowance & Tuition
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                Manage monthly home allowances, tutoring incomes, freelancing gigs, and scholarships all in one ledger.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                <PieIcon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-base font-bold text-neutral-900">
                Smart Financial Health
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                Get an instant 0–100 Financial Health Score that tells you whether your spending rate will last the month.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Coins className="h-6 w-6" />
              </div>
              <h3 className="font-display text-base font-bold text-neutral-900">
                Recurring Campus Bills
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                Pre-schedule hostel rent, WiFi bills, and tuition installments so you're never caught off guard on the 1st.
              </p>
            </div>

          </div>
        </section>

        {/* Interactive Savings Simulator Section */}
        <section id="simulator" className="px-6 py-16 sm:px-10 lg:px-14">
          <div className="rounded-3xl border border-neutral-200 bg-gradient-to-br from-neutral-950 via-neutral-900 to-[#0f172a] p-8 sm:p-12 text-white">
            <div className="grid items-center gap-10 lg:grid-cols-12">
              
              <div className="lg:col-span-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300">
                  <Calculator className="h-3.5 w-3.5" />
                  Interactive Simulator
                </span>
                <h2 className="mt-4 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  See how much you could save this semester
                </h2>
                <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
                  Adjust your estimated monthly allowance and expenses. PocketPilot shows you the projected savings surplus and financial health score in real-time.
                </p>

                {/* Sliders */}
                <div className="mt-8 space-y-6">
                  <div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-neutral-400">Monthly Allowance / Inflow</span>
                      <span className="text-white font-mono">৳ {allowance.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min={5000}
                      max={60000}
                      step={1000}
                      value={allowance}
                      onChange={(e) => setAllowance(Number(e.target.value))}
                      className="mt-2 w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-neutral-400">Monthly Expenses & Bills</span>
                      <span className="text-white font-mono">৳ {estimatedSpend.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min={2000}
                      max={55000}
                      step={500}
                      value={estimatedSpend}
                      onChange={(e) => setEstimatedSpend(Number(e.target.value))}
                      className="mt-2 w-full accent-blue-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Calculator Output Display */}
              <div className="lg:col-span-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-black/30 p-4">
                      <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                        Projected Monthly Savings
                      </div>
                      <div className="mt-2 font-display text-2xl sm:text-3xl font-bold text-emerald-400">
                        ৳ {potentialSavings.toLocaleString()}
                      </div>
                      <div className="mt-1 text-[11px] text-neutral-400">
                        ৳ {(potentialSavings * 6).toLocaleString()} per semester
                      </div>
                    </div>

                    <div className="rounded-xl bg-black/30 p-4">
                      <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                        Health Score
                      </div>
                      <div className="mt-2 font-display text-2xl sm:text-3xl font-bold text-blue-400">
                        {healthScore} / 100
                      </div>
                      <div className="mt-1 text-[11px] text-neutral-400">
                        {healthScore >= 70 ? "🔥 Excellent pacing" : "⚠️ High expense ratio"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-4">
                    <div className="text-xs text-neutral-300">
                      Ready to take control of your student budget?
                    </div>
                    <Link
                      to="/auth"
                      className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-glow transition-all hover:bg-blue-500"
                    >
                      Login & Start Saving
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Pricing & Free Tier Section */}
        <section id="pricing" className="border-t border-neutral-100 bg-neutral-50/50 px-6 py-16 sm:px-10 lg:px-14">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Simple Pricing
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-neutral-950">
              Free forever for all students
            </h2>
            <p className="mt-3 text-sm text-neutral-500">
              No hidden fees, no credit card lockouts. PocketPilot was built to help you master your finances during college.
            </p>
          </div>

          <div className="mt-12 mx-auto max-w-md rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-neutral-950">Student Plan</h3>
                <p className="text-xs text-neutral-500">Complete access to all features</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                100% Free
              </span>
            </div>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-display text-4xl font-extrabold text-neutral-950">৳ 0</span>
              <span className="text-sm text-neutral-500">/ forever</span>
            </div>

            <ul className="mt-6 space-y-3 text-xs text-neutral-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Unlimited expense & income logging
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Recurring bills reminders & calendar
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Real-time visual charts & insights
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Financial Health Score algorithm
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Data export & cloud synchronization
              </li>
            </ul>

            <Link
              to="/auth"
              className="mt-8 flex w-full items-center justify-center rounded-2xl bg-neutral-950 py-3 text-sm font-semibold text-white transition-all hover:bg-neutral-800"
            >
              Get Started Now
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-neutral-100 px-6 py-8 sm:px-10 lg:px-14">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-neutral-950 text-white text-[10px] font-bold">
                P
              </div>
              <span className="font-semibold text-neutral-900">PocketPilot</span>
              <span>— Smart Money for University Students</span>
            </div>
            <div>
              © {new Date().getFullYear()} PocketPilot. Designed with care.
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
