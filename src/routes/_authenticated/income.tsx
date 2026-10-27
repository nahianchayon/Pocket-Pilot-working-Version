import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useFinance } from "@/state/finance-store";
import { INCOME_SOURCES, type IncomeSource, formatCurrency } from "@/lib/finance";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/income")({
  head: () => ({
    meta: [
      { title: "Income · PocketPilot" },
      { name: "description", content: "Track extra income from tuitions, freelancing, scholarships, and more." },
    ],
  }),
  component: IncomePage,
});

function IncomePage() {
  const { incomes, addIncome, removeIncome, budget, totalExtraIncome, totalIncome } = useFinance();
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState<IncomeSource>("Tuition");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(amount);
    if (!n || n <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    addIncome({
      amount: n,
      source,
      note: note.trim() || undefined,
      date: new Date(date).toISOString(),
    });
    setAmount("");
    setNote("");
    toast.success(`+ ${formatCurrency(n, budget.currency)} from ${source}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Earn"
        title="Income"
        description="Side hustles and scholarships add up. Track every inflow."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Monthly allowance" value={formatCurrency(budget.monthlyAllowance, budget.currency)} />
        <Stat label="Extra income (this month)" value={formatCurrency(totalExtraIncome, budget.currency)} tone />
        <Stat label="Total inflow" value={formatCurrency(totalIncome, budget.currency)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="glass rounded-3xl p-5 shadow-soft">
          <div className="mb-3 font-display text-xl font-semibold">All income</div>
          {incomes.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-border p-12 text-sm text-muted-foreground">
              No extra income logged yet.
            </div>
          ) : (
            <ul className="space-y-2">
              <AnimatePresence initial={false}>
                {incomes.map((i) => (
                  <motion.li
                    key={i.id}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="group flex items-center justify-between rounded-2xl border border-border/60 bg-card/60 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-success/15 text-success">
                        <TrendingUp className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="font-medium">{i.note || i.source}</div>
                        <div className="text-xs text-muted-foreground">
                          {i.source} · {new Date(i.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-success">
                        +{formatCurrency(i.amount, budget.currency)}
                      </span>
                      <button
                        onClick={() => removeIncome(i.id)}
                        className="rounded-lg p-2 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        <form onSubmit={submit} className="glass h-fit space-y-4 rounded-3xl p-5 shadow-soft">
          <div className="font-display text-xl font-semibold">Add income</div>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Amount</span>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-input bg-background/60 px-3 py-2.5 text-lg font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Source</span>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as IncomeSource)}
              className="w-full rounded-xl border border-input bg-background/60 px-3 py-2.5 text-sm focus:border-primary"
            >
              {INCOME_SOURCES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Note</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Math tuition — Class 9"
              className="w-full rounded-xl border border-input bg-background/60 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-input bg-background/60 px-3 py-2.5 text-sm focus:border-primary"
            />
          </label>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            <Plus className="h-4 w-4" /> Add income
          </button>
        </form>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: boolean }) {
  return (
    <div className="glass rounded-3xl p-5 shadow-soft">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div
        className={`mt-2 font-display text-2xl font-semibold ${tone ? "text-success" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}
