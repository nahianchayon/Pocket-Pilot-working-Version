import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useFinance } from "@/state/finance-store";
import {
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
  formatCurrency,
  sumBy,
} from "@/lib/finance";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/bills")({
  head: () => ({
    meta: [
      { title: "Recurring Bills · PocketPilot" },
      { name: "description", content: "Manage recurring bills and never miss a due date." },
    ],
  }),
  component: BillsPage,
});

function BillsPage() {
  const { recurring, addRecurring, removeRecurring, budget } = useFinance();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("1");
  const [category, setCategory] = useState<ExpenseCategory>("Utilities");

  const total = sumBy(recurring, (r) => r.amount);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(amount);
    const d = parseInt(dueDay);
    if (!name.trim() || !n || n <= 0 || !d || d < 1 || d > 31) {
      toast.error("Fill name, amount and a valid day (1-31)");
      return;
    }
    addRecurring({ name: name.trim(), amount: n, dueDay: d, category });
    setName("");
    setAmount("");
    toast.success("Bill added");
  };

  const today = new Date();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reminders"
        title="Recurring bills"
        description="University fees, rent, WiFi, meal plans — keep them all in one calendar."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Bills tracked" value={`${recurring.length}`} />
        <Stat label="Monthly recurring" value={formatCurrency(total, budget.currency)} accent />
        <Stat label="Free after bills" value={formatCurrency(budget.monthlyAllowance - total, budget.currency)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="glass rounded-3xl p-5 shadow-soft">
          <div className="mb-3 font-display text-xl font-semibold">Schedule</div>
          {recurring.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-border p-12 text-sm text-muted-foreground">
              No bills yet. Add your first.
            </div>
          ) : (
            <ul className="space-y-2">
              <AnimatePresence initial={false}>
                {recurring
                  .slice()
                  .sort((a, b) => a.dueDay - b.dueDay)
                  .map((r) => {
                    const due = new Date(today.getFullYear(), today.getMonth(), r.dueDay);
                    const days = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <motion.li
                        key={r.id}
                        layout
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="group flex items-center justify-between rounded-2xl border border-border/60 bg-card/60 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                            <div className="text-center">
                              <div className="text-[10px] uppercase opacity-80">Day</div>
                              <div className="font-display text-sm font-bold">{r.dueDay}</div>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{r.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {r.category} · {statusLabel(days)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {formatCurrency(r.amount, budget.currency)}
                          </span>
                          <button
                            onClick={() => removeRecurring(r.id)}
                            className="rounded-lg p-2 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.li>
                    );
                  })}
              </AnimatePresence>
            </ul>
          )}
        </div>

        <form onSubmit={submit} className="glass h-fit space-y-4 rounded-3xl p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <div className="font-display text-xl font-semibold">Add bill</div>
          </div>
          <Field label="Name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. WiFi"
              className="w-full rounded-xl border border-input bg-background/60 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </Field>
          <Field label="Amount">
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-input bg-background/60 px-3 py-2.5 text-lg font-semibold focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Due day">
              <input
                type="number"
                min={1}
                max={31}
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                className="w-full rounded-xl border border-input bg-background/60 px-3 py-2.5 text-sm focus:border-primary"
              />
            </Field>
            <Field label="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full rounded-xl border border-input bg-background/60 px-3 py-2.5 text-sm focus:border-primary"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            <Plus className="h-4 w-4" /> Add bill
          </button>
        </form>
      </div>
    </div>
  );
}

function statusLabel(days: number) {
  if (days < 0) return `Paid ${-days}d ago`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="glass rounded-3xl p-5 shadow-soft">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-2 font-display text-2xl font-semibold ${accent ? "text-primary" : ""}`}>
        {value}
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
