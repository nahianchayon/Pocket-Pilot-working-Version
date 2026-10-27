import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_BUDGET,
  type BudgetSettings,
  type Expense,
  type ExpenseCategory,
  type Income,
  type IncomeSource,
  type RecurringBill,
  inCurrentMonth,
  sumBy,
} from "@/lib/finance";
import {
  subscribeToAuth,
  logout,
  getUserProfile,
  saveUserProfile,
  getUserExpenses,
  addUserExpense,
  deleteUserExpense,
  getUserIncomes,
  addUserIncome,
  deleteUserIncome,
  getUserRecurring,
  addUserRecurring,
  deleteUserRecurring,
  type AuthUser,
} from "@/lib/firebase";

type FinanceCtx = {
  loading: boolean;
  userId: string | null;
  userEmail: string | null;
  profile: {
    full_name: string | null;
    university: string | null;
    user_type: "student" | "job_holder" | "both";
    avatar_url: string | null;
  };
  updateProfile: (p: Partial<FinanceCtx["profile"]>) => Promise<void>;
  budget: BudgetSettings;
  setBudget: (b: BudgetSettings) => Promise<void>;
  expenses: Expense[];
  addExpense: (e: Omit<Expense, "id">) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  incomes: Income[];
  addIncome: (i: Omit<Income, "id">) => Promise<void>;
  removeIncome: (id: string) => Promise<void>;
  recurring: RecurringBill[];
  setRecurring: (r: RecurringBill[]) => void;
  addRecurring: (r: Omit<RecurringBill, "id">) => Promise<void>;
  removeRecurring: (id: string) => Promise<void>;
  signOut: () => Promise<void>;
  // derived
  monthExpenses: Expense[];
  monthIncomes: Income[];
  totalSpent: number;
  totalExtraIncome: number;
  totalIncome: number;
  remaining: number;
  savings: number;
};

const Ctx = createContext<FinanceCtx | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<FinanceCtx["profile"]>({
    full_name: null,
    university: null,
    user_type: "student",
    avatar_url: null,
  });
  const [budget, setBudgetState] = useState<BudgetSettings>(DEFAULT_BUDGET);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [recurring, setRecurringState] = useState<RecurringBill[]>([]);

  // Auth listener with Firebase
  useEffect(() => {
    const unsubscribe = subscribeToAuth((authUser: AuthUser | null) => {
      setUserId(authUser?.uid ?? null);
      setUserEmail(authUser?.email ?? null);
      if (!authUser) {
        setProfile({
          full_name: null,
          university: null,
          user_type: "student",
          avatar_url: null,
        });
        setBudgetState(DEFAULT_BUDGET);
        setExpenses([]);
        setIncomes([]);
        setRecurringState([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load real user data when authenticated
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [prof, userExps, userIncs, userBills] = await Promise.all([
          getUserProfile(userId),
          getUserExpenses(userId),
          getUserIncomes(userId),
          getUserRecurring(userId),
        ]);

        if (cancelled) return;

        if (prof) {
          setProfile({
            full_name: prof.full_name,
            university: prof.university,
            user_type: prof.user_type ?? "student",
            avatar_url: prof.avatar_url,
          });
          setBudgetState({
            monthlyAllowance: Number(prof.monthly_allowance) || 0,
            savingsGoal: Number(prof.savings_goal) || 0,
            currency: prof.currency || "BDT",
          });
        }

        setExpenses(userExps);
        setIncomes(userIncs);
        setRecurringState(userBills);
      } catch (err) {
        console.error("Error loading user finance data:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const updateProfile = useCallback<FinanceCtx["updateProfile"]>(
    async (p) => {
      if (!userId) return;
      const next = { ...profile, ...p };
      setProfile(next);
      await saveUserProfile(userId, p);
    },
    [profile, userId],
  );

  const setBudget = useCallback<FinanceCtx["setBudget"]>(
    async (b) => {
      setBudgetState(b);
      if (!userId) return;
      await saveUserProfile(userId, {
        monthly_allowance: b.monthlyAllowance,
        savings_goal: b.savingsGoal,
        currency: b.currency,
      });
    },
    [userId],
  );

  const addExpense = useCallback<FinanceCtx["addExpense"]>(
    async (e) => {
      if (!userId) return;
      const created = await addUserExpense(userId, e);
      setExpenses((prev) => [created, ...prev]);
    },
    [userId],
  );

  const removeExpense = useCallback(
    async (id: string) => {
      if (!userId) return;
      await deleteUserExpense(userId, id);
      setExpenses((prev) => prev.filter((x) => x.id !== id));
    },
    [userId],
  );

  const addIncome = useCallback<FinanceCtx["addIncome"]>(
    async (i) => {
      if (!userId) return;
      const created = await addUserIncome(userId, i);
      setIncomes((prev) => [created, ...prev]);
    },
    [userId],
  );

  const removeIncome = useCallback(
    async (id: string) => {
      if (!userId) return;
      await deleteUserIncome(userId, id);
      setIncomes((prev) => prev.filter((x) => x.id !== id));
    },
    [userId],
  );

  const addRecurring = useCallback<FinanceCtx["addRecurring"]>(
    async (r) => {
      if (!userId) return;
      const created = await addUserRecurring(userId, r);
      setRecurringState((prev) => [created, ...prev]);
    },
    [userId],
  );

  const removeRecurring = useCallback(
    async (id: string) => {
      if (!userId) return;
      await deleteUserRecurring(userId, id);
      setRecurringState((prev) => prev.filter((x) => x.id !== id));
    },
    [userId],
  );

  const signOut = useCallback(async () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pp.signed_out", "true");
    }
    await logout();
    setUserId(null);
    setUserEmail(null);
    setExpenses([]);
    setIncomes([]);
    setRecurringState([]);
  }, []);

  const value = useMemo<FinanceCtx>(() => {
    const monthExpenses = expenses.filter((e) => inCurrentMonth(e.date));
    const monthIncomes = incomes.filter((i) => inCurrentMonth(i.date));
    const totalSpent = sumBy(monthExpenses, (e) => e.amount);
    const totalExtraIncome = sumBy(monthIncomes, (i) => i.amount);
    const totalIncome = budget.monthlyAllowance + totalExtraIncome;
    const remaining = totalIncome - totalSpent;
    const savings = Math.max(0, remaining);
    return {
      loading,
      userId,
      userEmail,
      profile,
      updateProfile,
      budget,
      setBudget,
      expenses,
      addExpense,
      removeExpense,
      incomes,
      addIncome,
      removeIncome,
      recurring,
      setRecurring: setRecurringState,
      addRecurring,
      removeRecurring,
      signOut,
      monthExpenses,
      monthIncomes,
      totalSpent,
      totalExtraIncome,
      totalIncome,
      remaining,
      savings,
    };
  }, [
    loading,
    userId,
    userEmail,
    profile,
    updateProfile,
    budget,
    setBudget,
    expenses,
    addExpense,
    removeExpense,
    incomes,
    addIncome,
    removeIncome,
    recurring,
    addRecurring,
    removeRecurring,
    signOut,
  ]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFinance() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useFinance must be used within FinanceProvider");
  return v;
}
