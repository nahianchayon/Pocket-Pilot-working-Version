import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useFinance } from "@/state/finance-store";
import {
  CATEGORY_COLORS,
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
  formatCurrency,
} from "@/lib/finance";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/expenses")({
  head: () => ({
    meta: [
      { title: "Expenses · PocketPilot" },
      { name: "description", content: "Log and review every expense with notes and categories." },
    ],
  }),
  component: ExpensesPage,
});

function ExpensesPage() {
  const { expenses, addExpense, removeExpense, budget } = useFinance();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Food");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [filter, setFilter] = useState<ExpenseCategory | "All">("All");
  const [query, setQuery] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(amount);
    if (!n || n <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    addExpense({
      amount: n,
      category,
      note: note.trim() || undefined,
      date: new Date(date).toISOString(),
    });
    setAmount("");
    setNote("");
    toast.success(`Logged ${formatCurrency(n, budget.currency)} on ${category}`);
  };

  const filtered = expenses
    .filter((e) => (filter === "All" ? true : e.category === filter))
    .filter((e) =>
      query
        ? (e.note ?? "").toLowerCase().includes(query.toLowerCase()) ||
          e.category.toLowerCase().includes(query.toLowerCase())
        : true,
    );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Track"
        title="Expenses"
        description="Every taka counts. Log it, categorize it, learn from it."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* List */}
        <div className="glass rounded-3xl p-5 shadow-soft">
          <div className="mb-4 flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes or category…"
                className="w-full rounded-xl border border-input bg-background/60 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as ExpenseCategory | "All")}
              className="rounded-xl border border-input bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              <option value="All">All categories</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              No expenses match. Add your first on the right.
            </div>
          ) : (
            <ul className="space-y-2">
              <AnimatePresence initial={false}>
                {filtered.map((e) => (
                  <motion.li
                    key={e.id}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="group flex items-center justify-between rounded-2xl border border-border/60 bg-card/60 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="grid h-10 w-10 place-items-center rounded-xl text-xs font-bold uppercase"
                        style={{
                          background: `color-mix(in oklab, ${CATEGORY_COLORS[e.category]} 18%, transparent)`,
                          color: CATEGORY_COLORS[e.category],
                        }}
                      >
                        {e.category.slice(0, 2)}
                      </span>
                      <div>
                        <div className="font-medium">{e.note || e.category}</div>
                        <div className="text-xs text-muted-foreground">
                          {e.category} · {new Date(e.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        −{formatCurrency(e.amount, budget.currency)}
                      </span>
                      <button
                        onClick={() => removeExpense(e.id)}
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

        {/* Add form */}
        <form
          onSubmit={submit}
          className="glass sticky top-6 h-fit space-y-4 rounded-3xl p-5 shadow-soft"
        >
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Quick add
            </div>
            <div className="font-display text-xl font-semibold">New expense</div>
          </div>

          <Field label="Amount">
            <div className="relative">
              <input
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-input bg-background/60 px-3 py-2.5 pr-16 text-lg font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                {budget.currency}
              </span>
            </div>
          </Field>

          <Field label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full rounded-xl border border-input bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Note (optional)">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Lunch with friends"
              className="w-full rounded-xl border border-input bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </Field>

          <Field label="Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-input bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </Field>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.01]"
          >
            <Plus className="h-4 w-4" /> Add expense
          </button>
        </form>
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
