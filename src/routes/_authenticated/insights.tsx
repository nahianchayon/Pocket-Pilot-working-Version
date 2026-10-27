import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Brain, Flame, Trophy, TrendingDown, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useFinance } from "@/state/finance-store";
import { CATEGORY_COLORS, EXPENSE_CATEGORIES, formatCurrency, sumBy } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({
    meta: [
      { title: "Insights · PocketPilot" },
      { name: "description", content: "AI-style insights, frugal living tips and spending patterns." },
    ],
  }),
  component: InsightsPage,
});

function InsightsPage() {
  const { expenses, monthExpenses, totalSpent, totalIncome, budget } = useFinance();

  // Weekday heatmap
  const weekdayTotals = Array.from({ length: 7 }, (_, i) => ({
    day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i],
    value: sumBy(expenses.filter((e) => new Date(e.date).getDay() === i), (e) => e.amount),
  }));
  const maxDay = Math.max(...weekdayTotals.map((d) => d.value), 1);

  // Last 7 days spend
  const today = new Date();
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const total = sumBy(
      expenses.filter((e) => e.date.slice(0, 10) === key),
      (e) => e.amount,
    );
    return { date: d.toLocaleDateString(undefined, { weekday: "short" }), value: total };
  });
  const last7Total = sumBy(last7, (d) => d.value);

  // Categories
  const cats = EXPENSE_CATEGORIES.map((c) => ({
    name: c,
    value: sumBy(monthExpenses.filter((e) => e.category === c), (e) => e.amount),
    color: CATEGORY_COLORS[c],
  }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);

  const topCat = cats[0];
  const tips = buildTips(cats, totalIncome, totalSpent, budget.currency);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI Insights"
        title="Your money story"
        description="Patterns, predictions, and frugal moves tailored to how you actually spend."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Hero
          icon={<Trophy className="h-4 w-4" />}
          label="Top category"
          value={topCat?.name || "—"}
          sub={topCat ? formatCurrency(topCat.value, budget.currency) : "No data yet"}
        />
        <Hero
          icon={<Flame className="h-4 w-4" />}
          label="Last 7 days"
          value={formatCurrency(last7Total, budget.currency)}
          sub={`Avg ${formatCurrency(last7Total / 7, budget.currency)} / day`}
        />
        <Hero
          icon={totalSpent > totalIncome * 0.8 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          label="Burn rate"
          value={`${Math.round((totalSpent / Math.max(1, totalIncome)) * 100)}%`}
          sub={`of your ${formatCurrency(totalIncome, budget.currency)} budget`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Heatmap */}
        <div className="glass rounded-3xl p-5 shadow-soft">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Heatmap</div>
          <div className="font-display text-xl font-semibold">Spending by weekday</div>
          <div className="mt-5 grid grid-cols-7 gap-2">
            {weekdayTotals.map((d) => {
              const intensity = d.value / maxDay;
              return (
                <motion.div
                  key={d.day}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className="grid aspect-square w-full place-items-center rounded-2xl border border-border/60"
                    style={{
                      background: `color-mix(in oklab, var(--color-primary) ${Math.round(intensity * 75)}%, transparent)`,
                      color: intensity > 0.5 ? "var(--color-primary-foreground)" : "var(--color-foreground)",
                    }}
                  >
                    <span className="text-xs font-semibold">
                      {d.value > 0 ? Math.round(d.value) : "·"}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase text-muted-foreground">{d.day}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Last 7 days bars */}
        <div className="glass rounded-3xl p-5 shadow-soft">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Trend</div>
          <div className="font-display text-xl font-semibold">Last 7 days</div>
          <div className="mt-6 flex h-44 items-end gap-2">
            {last7.map((d) => {
              const pct = (d.value / Math.max(1, ...last7.map((x) => x.value))) * 100;
              return (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full rounded-t-xl bg-gradient-primary shadow-glow"
                    style={{ minHeight: 4 }}
                  />
                  <span className="text-[10px] text-muted-foreground">{d.date}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="glass rounded-3xl p-5 shadow-soft">
        <div className="mb-4 font-display text-xl font-semibold">Category breakdown — this month</div>
        {cats.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-border p-10 text-sm text-muted-foreground">
            No spending logged yet.
          </div>
        ) : (
          <div className="space-y-3">
            {cats.map((c) => {
              const pct = (c.value / totalSpent) * 100;
              return (
                <div key={c.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                      {c.name}
                    </span>
                    <span className="text-muted-foreground">
                      {formatCurrency(c.value, budget.currency)} · {Math.round(pct)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: c.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tips */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <h2 className="font-display text-xl font-semibold">Smart suggestions</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {tips.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-4 shadow-soft"
            >
              <div
                className="mb-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                style={{
                  background: `color-mix(in oklab, ${t.color} 18%, transparent)`,
                  color: t.color,
                }}
              >
                {t.tag}
              </div>
              <div className="text-sm leading-relaxed">{t.text}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Hero({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="glass rounded-3xl p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary/15 text-primary">
          {icon}
        </div>
      </div>
      <div className="mt-3 font-display text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function buildTips(
  cats: { name: string; value: number; color: string }[],
  income: number,
  spent: number,
  currency: string,
) {
  const tips: { tag: string; text: string; color: string }[] = [];

  if (cats.length === 0 && spent === 0) {
    tips.push({
      tag: "Start",
      text: "Log your first expenses to unlock personalized spending insights and frugal habits.",
      color: "var(--color-primary)",
    });
  }

  if (income > 0 && cats[0] && cats[0].value > income * 0.25) {
    const save = Math.round(cats[0].value * 0.15);
    tips.push({
      tag: "Trim",
      text: `${cats[0].name} eats ${Math.round((cats[0].value / Math.max(1, spent)) * 100)}% of your spend. Cut it by 15% to free up ${formatCurrency(save, currency)} this month.`,
      color: "var(--color-warning)",
    });
  }

  if (income > 0 && spent > income * 0.8) {
    tips.push({
      tag: "Caution",
      text: `You've used over 80% of your budget. Pause non-essentials and re-evaluate weekly.`,
      color: "var(--color-destructive)",
    });
  } else if (income > 0 && spent < income * 0.5) {
    tips.push({
      tag: "Great",
      text: `Under 50% spent. Lock the surplus into savings before lifestyle creep sets in.`,
      color: "var(--color-success)",
    });
  }

  const fuel = cats.find((c) => c.name === "Fuel");
  if (fuel && fuel.value > 800) {
    tips.push({
      tag: "Habit",
      text: `Bike fuel at ${formatCurrency(fuel.value, currency)} — try ride-sharing twice a week to drop it ~30%.`,
      color: "var(--color-chart-2)",
    });
  }

  const food = cats.find((c) => c.name === "Food");
  if (food && food.value > income * 0.2) {
    tips.push({
      tag: "Kitchen",
      text: `Food is over 20% of income. Two home-cooked meals a week can save ~${formatCurrency(food.value * 0.2, currency)}.`,
      color: "var(--color-chart-3)",
    });
  }

  tips.push({
    tag: "Habit",
    text: `Try the 24-hour rule: wait a day before any non-essential purchase above ${formatCurrency(500, currency)}.`,
    color: "var(--color-primary)",
  });

  return tips.slice(0, 6);
}
