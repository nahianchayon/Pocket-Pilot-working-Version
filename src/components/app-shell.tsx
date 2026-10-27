import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  TrendingUp,
  Sparkles,
  Settings,
  Bell,
  LogOut,
  Home,
} from "lucide-react";
import { useFinance } from "@/state/finance-store";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/income", label: "Income", icon: TrendingUp },
  { to: "/insights", label: "Insights", icon: Sparkles },
  { to: "/budget", label: "Budget", icon: Wallet },
  { to: "/bills", label: "Bills", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell() {
  const location = useLocation();
  return (
    <div className="relative min-h-screen bg-background bg-mesh">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-mesh opacity-80" />
      <div className="relative mx-auto flex max-w-[1400px] gap-6 px-4 py-6 lg:px-8">
        {/* Sidebar */}
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-[260px] shrink-0 lg:block">
          <div className="glass flex h-full flex-col rounded-3xl p-5 shadow-soft">
            <Link to="/dashboard" className="mb-8 flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-lg font-semibold leading-tight">
                  PocketPilot
                </div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Student Finance
                </div>
              </div>
            </Link>

            <nav className="flex flex-1 flex-col gap-1">
              {nav.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 -z-10 rounded-xl bg-gradient-primary shadow-glow"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <Link
              to="/"
              className="my-2 flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <Home className="h-4 w-4" />
              Website Home
            </Link>

            <UserBlock />

            <div className="mt-4 rounded-2xl border border-border/60 bg-gradient-primary p-4 text-primary-foreground shadow-glow">
              <div className="text-xs opacity-90">Frugal tip</div>
              <div className="mt-1 text-sm font-medium leading-snug">
                Track every cup of chai. Tiny leaks sink big budgets.
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          {/* Mobile top bar */}
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                <Wallet className="h-4 w-4" />
              </div>
              <span className="font-display text-lg font-semibold">PocketPilot</span>
            </Link>
            <Link
              to="/"
              className="rounded-lg border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Website
            </Link>
          </div>

          <Outlet />

          {/* Mobile bottom nav */}
          <nav className="fixed inset-x-3 bottom-3 z-40 lg:hidden">
            <div className="glass-strong flex items-center justify-around rounded-2xl px-2 py-2 shadow-soft">
              {nav.slice(0, 5).map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium ${
                      active ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </Link>
                );
              })}
            </div>
          </nav>
          <div className="h-20 lg:hidden" />
        </main>
      </div>
    </div>
  );
}

function UserBlock() {
  const { userEmail, profile, signOut } = useFinance();
  const navigate = useNavigate();
  if (!userEmail) return null;
  const initials =
    (profile.full_name || userEmail)
      .split(/\s+|@/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "P";
  return (
    <div className="mt-2 flex items-center gap-3 rounded-2xl border border-border/60 bg-card/60 p-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground shadow-glow">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">
          {profile.full_name || "Student"}
        </div>
        <div className="truncate text-[11px] text-muted-foreground">{userEmail}</div>
      </div>
      <button
        onClick={async () => {
          await signOut();
          navigate({ to: "/auth", replace: true });
        }}
        aria-label="Sign out"
        className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
