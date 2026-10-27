export type ExpenseCategory =
  | "Education"
  | "Rent"
  | "Food"
  | "Transportation"
  | "Fuel"
  | "Shopping"
  | "Medical"
  | "Entertainment"
  | "Emergency"
  | "Subscription"
  | "Utilities"
  | "Miscellaneous";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Education",
  "Rent",
  "Food",
  "Transportation",
  "Fuel",
  "Shopping",
  "Medical",
  "Entertainment",
  "Emergency",
  "Subscription",
  "Utilities",
  "Miscellaneous",
];

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Education: "var(--color-chart-1)",
  Rent: "var(--color-chart-5)",
  Food: "var(--color-chart-3)",
  Transportation: "var(--color-chart-2)",
  Fuel: "var(--color-warning)",
  Shopping: "var(--color-chart-5)",
  Medical: "var(--color-destructive)",
  Entertainment: "var(--color-chart-3)",
  Emergency: "var(--color-destructive)",
  Subscription: "var(--color-chart-1)",
  Utilities: "var(--color-chart-2)",
  Miscellaneous: "var(--color-muted-foreground)",
};

export type Expense = {
  id: string;
  amount: number;
  category: ExpenseCategory;
  note?: string;
  date: string; // ISO
};

export type IncomeSource =
  | "Allowance"
  | "Tuition"
  | "Freelancing"
  | "Scholarship"
  | "Part-time"
  | "Gift"
  | "Business"
  | "Other";

export const INCOME_SOURCES: IncomeSource[] = [
  "Allowance",
  "Tuition",
  "Freelancing",
  "Scholarship",
  "Part-time",
  "Gift",
  "Business",
  "Other",
];

export type Income = {
  id: string;
  amount: number;
  source: IncomeSource;
  note?: string;
  date: string;
};

export type RecurringBill = {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // day of month
  category: ExpenseCategory;
};

export type BudgetSettings = {
  monthlyAllowance: number;
  savingsGoal: number;
  currency: string;
};

export const DEFAULT_BUDGET: BudgetSettings = {
  monthlyAllowance: 0,
  savingsGoal: 0,
  currency: "BDT",
};

export const DEFAULT_RECURRING: RecurringBill[] = [];

export function formatCurrency(n: number, currency = "BDT") {
  const v = Math.round(n);
  return `${v.toLocaleString()} ${currency}`;
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function inCurrentMonth(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export function sumBy<T>(arr: T[], fn: (t: T) => number) {
  return arr.reduce((acc, x) => acc + fn(x), 0);
}

export function healthScore(opts: {
  budget: number;
  spent: number;
  savings: number;
  savingsGoal: number;
}) {
  if (opts.budget <= 0) return 0;
  const spendRatio = Math.min(opts.spent / opts.budget, 1.5);
  const savingsRatio = opts.savingsGoal > 0 ? Math.min(opts.savings / opts.savingsGoal, 1) : 0;
  const base = (1 - spendRatio) * 70 + savingsRatio * 30;
  return Math.max(0, Math.min(100, Math.round(base + 30)));
}
