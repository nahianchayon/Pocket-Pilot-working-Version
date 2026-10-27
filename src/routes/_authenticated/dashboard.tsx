import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  TrendingUp,
  Wallet,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/page-header";
import { useFinance } from "@/state/finance-store";
import {
  CATEGORY_COLORS,
  EXPENSE_CATEGORIES,
  formatCurrency,
  healthScore,
  sumBy,
} from "@/lib/finance";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · PocketPilot" },
      {
        name: "description",
        content: "Your monthly financial overview: budget, expenses, savings, and insights.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const {
    budget,
    monthExpenses,
    totalSpent,
    totalExtraIncome,
    totalIncome,
    remaining,
    savings,
    recurring,
  } = useFinance();

  const score = healthScore({
    budget: totalIncome,
    spent: totalSpent,
    savings,
    savingsGoal: budget.savingsGoal,
  });

  const today = new Date();
  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const dailyAvg = totalSpent / Math.max(1, dayOfMonth);
  const projected = dailyAvg * daysInMonth;

  // Category breakdown
  const byCategory = EXPENSE_CATEGORIES.map((c) => ({
    name: c,
    value: sumBy(monthExpenses.filter((e) => e.category === c), (e) => e.amount),
    color: CATEGORY_COLORS[c],
  })).filter((x) => x.value > 0);

  // Daily series for current month
  const daily = Array.from({ length: dayOfMonth }, (_, i) => {
    const day = i + 1;
    const total = sumBy(
      monthExpenses.filter((e) => new Date(e.date).getDate() === day),
      (e) => e.amount,
    );
    return { day: `${day}`, spent: total };
  });

  const emergency =
    budget.monthlyAllowance > 0 && remaining < budget.monthlyAllowance * 0.1;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title={`Hey, here's your money today.`}
        description={`You're on day ${dayOfMonth} of ${daysInMonth}. Spend wisely, future you is watching.`}
        actions={
          <Link
            to="/expenses"
            className="rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
          >
            + Add expense
          </Link>
        }
      />

      {emergency && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-destructive shadow-soft"
        >
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <div className="font-semibold">Emergency Budget Mode activated</div>
            <p className="text-sm opacity-90">
              You have {formatCurrency(remaining, budget.currency)} left for{" "}
              {daysInMonth - dayOfMonth} days. Cap daily spending at{" "}
              <strong>
                {formatCurrency(Math.max(0, remaining) / Math.max(1, daysInMonth - dayOfMonth), budget.currency)}
              </strong>
              .
            </p>
          </div>
        </motion.div>
      )}

      {/* Stat grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Wallet className="h-4 w-4" />}
          label="Monthly Budget"
          value={formatCurrency(totalIncome, budget.currency)}
          hint={`Allowance + ${formatCurrency(totalExtraIncome, budget.currency)} extra`}
          tone="primary"
        />
        <StatCard
          icon={<ArrowDownRight className="h-4 w-4" />}
          label="Total Spent"
          value={formatCurrency(totalSpent, budget.currency)}
          hint={`${Math.round((totalSpent / Math.max(1, totalIncome)) * 100)}% of budget`}
          tone="warning"
        />
        <StatCard
          icon={<PiggyBank className="h-4 w-4" />}
          label="Remaining"
          value={formatCurrency(remaining, budget.currency)}
          hint={`Avg ${formatCurrency(dailyAvg, budget.currency)} / day`}
          tone={remaining < 0 ? "destructive" : "success"}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Projected end-of-month"
          value={formatCurrency(Math.max(0, totalIncome - projected), budget.currency)}
          hint={projected > totalIncome ? "Over budget pace" : "On track"}
          tone={projected > totalIncome ? "destructive" : "success"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Spend trend */}
        <div className="glass rounded-3xl p-5 shadow-soft xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                Daily Spend Trend
              </div>
              <div className="font-display text-xl font-semibold">This month</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Daily average</div>
              <div className="font-display text-xl font-semibold text-primary">
                {formatCurrency(dailyAvg, budget.currency)}
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                  }}
                  formatter={(v: number) => formatCurrency(v, budget.currency)}
                />
                <Area
                  type="monotone"
                  dataKey="spent"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  fill="url(#spendFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Health score */}
        <div className="glass relative overflow-hidden rounded-3xl p-5 shadow-soft">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-primary opacity-20 blur-3xl" />
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Financial Health
          </div>
          <div className="mt-1 font-display text-xl font-semibold">Score this month</div>

          <div className="mt-6 flex items-center justify-center">
            <HealthRing score={score} />
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <Row label="Savings goal" value={formatCurrency(budget.savingsGoal, budget.currency)} />
            <Row label="Current savings" value={formatCurrency(savings, budget.currency)} accent />
            <Row label="Recurring bills" value={`${recurring.length} active`} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Category breakdown */}
        <div className="glass rounded-3xl p-5 shadow-soft">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Where it went
          </div>
          <div className="font-display text-xl font-semibold">Categories</div>
          <div className="mt-4 h-56">
            {byCategory.length === 0 ? (
              <EmptyChart label="No spending logged yet this month." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCategory}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    cornerRadius={6}
                  >
                    {byCategory.map((c) => (
                      <Cell key={c.name} fill={c.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-card)",
                    }}
                    formatter={(v: number) => formatCurrency(v, budget.currency)}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-4 space-y-2">
            {byCategory.slice(0, 4).map((c) => (
              <div key={c.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: c.color }}
                  />
                  {c.name}
                </span>
                <span className="font-medium">{formatCurrency(c.value, budget.currency)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category bars */}
        <div className="glass rounded-3xl p-5 shadow-soft xl:col-span-2">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Category usage
          </div>
          <div className="font-display text-xl font-semibold">Spending by category</div>
          <div className="mt-4 h-56">
            {byCategory.length === 0 ? (
              <EmptyChart label="Add an expense to see the breakdown." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-card)",
                    }}
                    formatter={(v: number) => formatCurrency(v, budget.currency)}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {byCategory.map((c) => (
                      <Cell key={c.name} fill={c.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming bills + Frugal tip */}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="glass rounded-3xl p-5 shadow-soft xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                Upcoming
              </div>
              <div className="font-display text-xl font-semibold">Recurring bills</div>
            </div>
            <Link to="/bills" className="text-sm font-medium text-primary hover:underline">
              Manage →
            </Link>
          </div>
          <div className="space-y-2">
            {recurring
              .slice()
              .sort((a, b) => a.dueDay - b.dueDay)
              .map((r) => {
                const due = new Date(today.getFullYear(), today.getMonth(), r.dueDay);
                const isPast = due < today;
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/60 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="grid h-10 w-10 place-items-center rounded-xl text-sm font-semibold"
                        style={{ background: "color-mix(in oklab, var(--color-primary) 12%, transparent)", color: "var(--color-primary)" }}
                      >
                        {r.dueDay}
                      </div>
                      <div>
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.category}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(r.amount, budget.currency)}
                      </div>
                      <div
                        className={`text-xs ${isPast ? "text-success" : "text-muted-foreground"}`}
                      >
                        {isPast ? "Paid this month" : `Due day ${r.dueDay}`}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-primary p-6 text-primary-foreground shadow-glow">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-90">
            <Sparkles className="h-4 w-4" /> Frugal AI
          </div>
          <div className="mt-2 font-display text-2xl font-semibold leading-tight">
            {frugalTip(byCategory, totalIncome, totalSpent, budget.currency)}
          </div>
          <Link
            to="/insights"
            className="mt-6 inline-flex items-center gap-1 rounded-xl bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/25"
          >
            See all insights <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  tone = "primary",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone?: "primary" | "success" | "warning" | "destructive";
}) {
  const toneMap = {
    primary: "var(--color-primary)",
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    destructive: "var(--color-destructive)",
  } as const;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass relative overflow-hidden rounded-3xl p-5 shadow-soft"
    >
      <div
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl"
        style={{ background: toneMap[tone] }}
      />
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div
          className="grid h-8 w-8 place-items-center rounded-xl"
          style={{
            background: `color-mix(in oklab, ${toneMap[tone]} 15%, transparent)`,
            color: toneMap[tone],
          }}
        >
          {icon}
        </div>
      </div>
      <div className="mt-3 font-display text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </motion.div>
  );
}

function HealthRing({ score }: { score: number }) {
  const r = 56;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color =
    score >= 70 ? "var(--color-success)" : score >= 40 ? "var(--color-warning)" : "var(--color-destructive)";
  return (
    <div className="relative grid place-items-center">
      <svg width={150} height={150} className="-rotate-90">
        <circle cx={75} cy={75} r={r} stroke="var(--color-muted)" strokeWidth={12} fill="none" />
        <motion.circle
          cx={75}
          cy={75}
          r={r}
          stroke={color}
          strokeWidth={12}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-3xl font-semibold">{score}</div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">/ 100</div>
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={accent ? "font-semibold text-primary" : "font-medium"}>{value}</span>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="grid h-full place-items-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function frugalTip(
  byCategory: { name: string; value: number }[],
  income: number,
  spent: number,
  currency: string,
) {
  if (spent === 0) return "Log your first expense to unlock personalized tips.";
  const top = byCategory.slice().sort((a, b) => b.value - a.value)[0];
  if (top && top.value > income * 0.25) {
    const saveable = Math.round(top.value * 0.15);
    return `Cut ${top.name.toLowerCase()} by 15% to save ${formatCurrency(saveable, currency)} this month.`;
  }
  if (spent > income * 0.8) {
    return "You've burned 80% of your budget. Brew chai at home this week.";
  }
  return "You're pacing well. Move the surplus into savings before it disappears.";
}
