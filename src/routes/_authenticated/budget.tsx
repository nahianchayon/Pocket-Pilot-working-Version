import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useFinance } from "@/state/finance-store";
import { DEFAULT_BUDGET, formatCurrency, sumBy } from "@/lib/finance";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/budget")({
  head: () => ({
    meta: [
      { title: "Budget · PocketPilot" },
      { name: "description", content: "Configure your monthly allowance and savings goal." },
    ],
  }),
  component: BudgetPage,
});

function BudgetPage() {
  const { budget, setBudget, recurring } = useFinance();
  const [allowance, setAllowance] = useState(String(budget.monthlyAllowance));
  const [goal, setGoal] = useState(String(budget.savingsGoal));
  const [currency, setCurrency] = useState(budget.currency);

  useEffect(() => {
    setAllowance(String(budget.monthlyAllowance));
    setGoal(String(budget.savingsGoal));
    setCurrency(budget.currency);
  }, [budget.monthlyAllowance, budget.savingsGoal, budget.currency]);

  const totalRecurring = sumBy(recurring, (r) => r.amount);
  const spendable = Math.max(0, Number(allowance || 0) - totalRecurring - Number(goal || 0));

  const save = () => {
    setBudget({
      monthlyAllowance: Number(allowance || 0),
      savingsGoal: Number(goal || 0),
      currency,
    });
    toast.success("Budget updated");
  };

  const reset = () => {
    setAllowance(String(DEFAULT_BUDGET.monthlyAllowance));
    setGoal(String(DEFAULT_BUDGET.savingsGoal));
    setCurrency(DEFAULT_BUDGET.currency);
    setBudget(DEFAULT_BUDGET);
    toast("Reset to defaults");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Plan"
        title="Monthly budget"
        description="Set your allowance, savings goal, and watch your free-to-spend recalculate live."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass space-y-4 rounded-3xl p-6 shadow-soft">
          <Field label="Monthly allowance">
            <BigInput value={allowance} onChange={setAllowance} suffix={currency} />
          </Field>
          <Field label="Savings goal">
            <BigInput value={goal} onChange={setGoal} suffix={currency} />
          </Field>
          <Field label="Currency">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-xl border border-input bg-background/60 px-3 py-2.5 text-sm focus:border-primary"
            >
              {["BDT", "USD", "INR", "EUR", "GBP", "PKR", "NPR", "LKR"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>

          <div className="flex gap-2 pt-2">
            <button
              onClick={save}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              <Save className="h-4 w-4" /> Save budget
            </button>
            <button
              onClick={reset}
              className="flex items-center gap-2 rounded-xl border border-input px-4 py-2.5 text-sm font-medium hover:bg-accent"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass rounded-3xl p-6 shadow-soft">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Live preview</div>
          <div className="font-display text-xl font-semibold">Where your allowance goes</div>

          <div className="mt-5 space-y-3">
            <Bar
              label="Recurring bills"
              value={totalRecurring}
              total={Number(allowance || 1)}
              color="var(--color-primary)"
              currency={currency}
            />
            <Bar
              label="Savings goal"
              value={Number(goal || 0)}
              total={Number(allowance || 1)}
              color="var(--color-success)"
              currency={currency}
            />
            <Bar
              label="Free to spend"
              value={spendable}
              total={Number(allowance || 1)}
              color="var(--color-warning)"
              currency={currency}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-border/60 bg-card/60 p-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Daily spending cap
            </div>
            <div className="mt-1 font-display text-2xl font-semibold">
              {formatCurrency(spendable / 30, currency)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Based on {formatCurrency(spendable, currency)} free over 30 days
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function BigInput({ value, onChange, suffix }: { value: string; onChange: (v: string) => void; suffix: string }) {
  return (
    <div className="relative">
      <input
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-input bg-background/60 px-4 py-3 pr-16 font-display text-xl font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
        {suffix}
      </span>
    </div>
  );
}

function Bar({
  label,
  value,
  total,
  color,
  currency,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
  currency: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / Math.max(1, total)) * 100));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{formatCurrency(value, currency)}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ background: color }}
          className="h-full rounded-full"
        />
      </div>
    </div>
  );
}
