import { useEffect, useMemo, useState } from "react";
import { BarChart3, CreditCard, PiggyBank, TrendingUp } from "lucide-react";
import { BillsBreakdownChart } from "../components/reports/BillsBreakdownChart";
import { FreeSpendingUsageChart } from "../components/reports/FreeSpendingUsageChart";
import { GoalProgressChart } from "../components/reports/GoalProgressChart";
import { IncomeExpenseChart } from "../components/reports/IncomeExpenseChart";
import { MonthlyTrendChart } from "../components/reports/MonthlyTrendChart";
import { SpendingByCategoryChart } from "../components/reports/SpendingByCategoryChart";
import { Card } from "../components/ui/Card";
import { useAuth } from "../hooks/useAuth";
// import { formatMoney } from "../lib/formatMoney";
import { useMoney } from "../hooks/useMoney";
import { fetchBills } from "../services/billService";
import { fetchFreeSpendingLimit } from "../services/budgetService";
import { seedDefaultCategoriesIfNeeded } from "../services/categoryService";
import { fetchGoals } from "../services/goalService";
import { fetchTransactions } from "../services/transactionService";
import type { Bill } from "../types/bill";
import type { Category } from "../types/category";
import type { Goal } from "../types/goal";
import type { Transaction } from "../types/transaction";

type MonthlyReportItem = {
  month: string;
  incomeCents: number;
  expensesCents: number;
  freeSpendingCents: number;
};

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function getLastSixMonths() {
  const months: {
    monthKey: string;
    label: string;
  }[] = [];

  const now = new Date();

  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);

    const monthKey = date.toISOString().slice(0, 7);

    const label = new Intl.DateTimeFormat("en-US", {
      month: "short",
    }).format(date);

    months.push({
      monthKey,
      label,
    });
  }

  return months;
}

export function ReportsPage() {
  const { user } = useAuth();
  const { money } = useMoney();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [freeSpendingLimitCents, setFreeSpendingLimitCents] = useState(40000);

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const currentMonth = getCurrentMonth();

  useEffect(() => {
    async function loadReportsData() {
      if (!user) {
        return;
      }

      setLoading(true);
      setPageError("");

      try {
        const [
          savedCategories,
          savedTransactions,
          savedBills,
          savedGoals,
          savedFreeSpendingLimit,
        ] = await Promise.all([
          seedDefaultCategoriesIfNeeded(user.id),
          fetchTransactions(user.id),
          fetchBills(user.id),
          fetchGoals(user.id),
          fetchFreeSpendingLimit(user.id, currentMonth),
        ]);

        setCategories(savedCategories);
        setTransactions(savedTransactions);
        setBills(savedBills);
        setGoals(savedGoals);
        setFreeSpendingLimitCents(savedFreeSpendingLimit);
      } catch (error) {
        if (error instanceof Error) {
          setPageError(error.message);
        } else {
          setPageError("Could not load reports data.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadReportsData();
  }, [user, currentMonth]);

  const transactionsForCurrentMonth = useMemo(() => {
    return transactions.filter((transaction) =>
      transaction.transactionDate.startsWith(currentMonth),
    );
  }, [transactions, currentMonth]);

  const totalIncomeCents = useMemo(() => {
    return transactionsForCurrentMonth
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + transaction.amountCents, 0);
  }, [transactionsForCurrentMonth]);

  const totalExpensesCents = useMemo(() => {
    return transactionsForCurrentMonth
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + transaction.amountCents, 0);
  }, [transactionsForCurrentMonth]);

  const monthlyBillsCents = useMemo(() => {
    return bills
      .filter((bill) => bill.isActive)
      .reduce((total, bill) => total + bill.amountCents, 0);
  }, [bills]);

  const totalGoalProgressCents = useMemo(() => {
    return goals.reduce((total, goal) => total + goal.currentCents, 0);
  }, [goals]);

  const freeSpendingUsedCents = useMemo(() => {
    return transactionsForCurrentMonth
      .filter((transaction) => {
        if (transaction.type !== "expense" || !transaction.categoryId) {
          return false;
        }

        const category = categories.find(
          (item) => item.id === transaction.categoryId,
        );

        return category?.countsTowardFreeSpending;
      })
      .reduce((total, transaction) => total + transaction.amountCents, 0);
  }, [transactionsForCurrentMonth, categories]);

  const monthlyTrendData = useMemo<MonthlyReportItem[]>(() => {
    const months = getLastSixMonths();

    return months.map((month) => {
      const transactionsForMonth = transactions.filter((transaction) =>
        transaction.transactionDate.startsWith(month.monthKey),
      );

      const incomeCents = transactionsForMonth
        .filter((transaction) => transaction.type === "income")
        .reduce((total, transaction) => total + transaction.amountCents, 0);

      const expensesCents = transactionsForMonth
        .filter((transaction) => transaction.type === "expense")
        .reduce((total, transaction) => total + transaction.amountCents, 0);

      const freeSpendingCents = transactionsForMonth
        .filter((transaction) => {
          if (transaction.type !== "expense" || !transaction.categoryId) {
            return false;
          }

          const category = categories.find(
            (item) => item.id === transaction.categoryId,
          );

          return category?.countsTowardFreeSpending;
        })
        .reduce((total, transaction) => total + transaction.amountCents, 0);

      return {
        month: month.label,
        incomeCents,
        expensesCents,
        freeSpendingCents,
      };
    });
  }, [transactions, categories]);

  const cashFlowCents = totalIncomeCents - totalExpensesCents;

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold text-blue-600">Reports</p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Financial insights
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Review real spending patterns, income versus expenses, free spending
          usage, recurring bills, and goal progress from Supabase.
        </p>
      </div>

      {pageError && (
        <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {pageError}
        </div>
      )}

      {loading ? (
        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-10 text-center shadow-xl shadow-slate-200/70 backdrop-blur">
          <p className="font-medium text-slate-600">Loading reports...</p>
        </div>
      ) : (
        <>
          <div className="mb-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Cash Flow
                  </p>

                  <p
                    className={`mt-3 text-2xl font-semibold ${
                      cashFlowCents < 0 ? "text-red-600" : "text-emerald-600"
                    }`}
                  >
                    {money(cashFlowCents)}
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                  <TrendingUp size={22} />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Expenses
                  </p>

                  <p className="mt-3 text-2xl font-semibold text-red-600">
                    {money(totalExpensesCents)}
                  </p>
                </div>

                <div className="rounded-2xl bg-red-50 p-3 text-red-600">
                  <CreditCard size={22} />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Monthly Bills
                  </p>

                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {money(monthlyBillsCents)}
                  </p>
                </div>

                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                  <BarChart3 size={22} />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Goal Progress
                  </p>

                  <p className="mt-3 text-2xl font-semibold text-amber-600">
                    {money(totalGoalProgressCents)}
                  </p>
                </div>

                <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                  <PiggyBank size={22} />
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <SpendingByCategoryChart
              transactions={transactionsForCurrentMonth}
              categories={categories}
            />

            <IncomeExpenseChart
              incomeCents={totalIncomeCents}
              expensesCents={totalExpensesCents}
            />

            <MonthlyTrendChart data={monthlyTrendData} />

            <FreeSpendingUsageChart
              limitCents={freeSpendingLimitCents}
              usedCents={freeSpendingUsedCents}
            />

            <BillsBreakdownChart bills={bills} />

            <GoalProgressChart goals={goals} />
          </div>
        </>
      )}
    </div>
  );
}