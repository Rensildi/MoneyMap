import { useEffect, useMemo, useState } from "react";
import { Plus, TrendingDown, TrendingUp, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import { FreeSpendingCard } from "../components/dashboard/FreeSpendingCard";
import { SpendingChart } from "../components/dashboard/SpendingChart";
import { Card } from "../components/ui/Card";
import { useAuth } from "../hooks/useAuth";
import { useMoney } from "../hooks/useMoney";
import { fetchAccounts } from "../services/accountService";
import { fetchBills } from "../services/billService";
import { fetchFreeSpendingLimit } from "../services/budgetService";
import { seedDefaultCategoriesIfNeeded } from "../services/categoryService";
import { fetchTransactions } from "../services/transactionService";
import type { Account } from "../types/account";
import type { Bill } from "../types/bill";
import type { Category } from "../types/category";
import type { Transaction } from "../types/transaction";

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function getBillDate(month: string, dueDay: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const lastDayOfMonth = new Date(year, monthNumber, 0).getDate();
  const safeDueDay = Math.min(dueDay, lastDayOfMonth);

  return new Date(year, monthNumber - 1, safeDueDay);
}

function formatBillDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function getDisplayName(email?: string, fullName?: string) {
  if (fullName && fullName.trim()) {
    return fullName.trim();
  }

  if (email) {
    return email.split("@")[0];
  }

  return "there";
}

export function DashboardPage() {
  const { user } = useAuth();
  const { money } = useMoney();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [freeSpendingLimitCents, setFreeSpendingLimitCents] = useState(40000);

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const currentMonth = useMemo(() => getCurrentMonth(), []);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) {
        return;
      }

      setLoading(true);
      setPageError("");

      try {
        const [
          savedAccounts,
          savedCategories,
          savedTransactions,
          savedBills,
          savedFreeSpendingLimit,
        ] = await Promise.all([
          fetchAccounts(user.id),
          seedDefaultCategoriesIfNeeded(user.id),
          fetchTransactions(user.id),
          fetchBills(user.id),
          fetchFreeSpendingLimit(user.id, currentMonth),
        ]);

        setAccounts(savedAccounts);
        setCategories(savedCategories);
        setTransactions(savedTransactions);
        setBills(savedBills);
        setFreeSpendingLimitCents(savedFreeSpendingLimit);
      } catch (error) {
        if (error instanceof Error) {
          setPageError(error.message);
        } else {
          setPageError("Could not load dashboard data.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user, currentMonth]);

  const transactionsForMonth = useMemo(() => {
    return transactions.filter((transaction) =>
      transaction.transactionDate.startsWith(currentMonth),
    );
  }, [transactions, currentMonth]);

  const totalBalanceCents = useMemo(() => {
    return accounts.reduce(
      (total, account) => total + account.balanceCents,
      0,
    );
  }, [accounts]);

  const incomeThisMonthCents = useMemo(() => {
    return transactionsForMonth
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + transaction.amountCents, 0);
  }, [transactionsForMonth]);

  const expensesThisMonthCents = useMemo(() => {
    return transactionsForMonth
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + transaction.amountCents, 0);
  }, [transactionsForMonth]);

  const freeSpendingUsedCents = useMemo(() => {
    return transactionsForMonth
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
  }, [transactionsForMonth, categories]);

  const spendingChartData = useMemo(() => {
    return categories
      .filter((category) => category.type === "expense")
      .map((category) => {
        const amountCents = transactionsForMonth
          .filter(
            (transaction) =>
              transaction.type === "expense" &&
              transaction.categoryId === category.id,
          )
          .reduce((total, transaction) => total + transaction.amountCents, 0);

        return {
          name: category.name,
          amountCents,
        };
      })
      .filter((item) => item.amountCents > 0)
      .sort((a, b) => b.amountCents - a.amountCents);
  }, [categories, transactionsForMonth]);

  const upcomingBills = useMemo(() => {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    return bills
      .map((bill) => {
        const billDate = getBillDate(currentMonth, bill.dueDay);

        return {
          ...bill,
          billDate,
        };
      })
      .filter((bill) => bill.billDate >= todayStart)
      .sort((a, b) => a.billDate.getTime() - b.billDate.getTime())
      .slice(0, 4);
  }, [bills, currentMonth]);

  const userName = getDisplayName(
    user?.email,
    user?.user_metadata?.full_name as string | undefined,
  );

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-blue-600">Dashboard</p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Good morning, {userName}
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Here is your real money snapshot for this month.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            to="/accounts"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-50 dark:bg-slate-900 dark:text-white dark:shadow-black/30 dark:hover:bg-slate-800"
          >
            <Plus size={18} />
            Add account
          </Link>

          <Link
            to="/transactions"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:shadow-black/30"
          >
            <Plus size={18} />
            Add transaction
          </Link>
        </div>
      </div>

      {pageError && (
        <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {pageError}
        </div>
      )}

      {loading ? (
        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-10 text-center shadow-xl shadow-slate-200/70 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/30">
          <p className="font-medium text-slate-600 dark:text-slate-300">
            Loading your dashboard...
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Total Balance
                  </p>

                  <h2
                    className={`mt-3 text-4xl font-semibold tracking-tight ${
                      totalBalanceCents < 0
                        ? "text-red-600"
                        : "text-slate-950 dark:text-white"
                    }`}
                  >
                    {money(totalBalanceCents)}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Across {accounts.length} manual account
                    {accounts.length === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                  <WalletCards size={24} />
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {accounts.slice(0, 3).map((account) => (
                  <div
                    key={account.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      {account.type.replace("_", " ")}
                    </p>

                    <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {account.name}
                    </p>

                    <p
                      className={`mt-1 text-lg font-semibold ${
                        account.balanceCents < 0
                          ? "text-red-600"
                          : "text-slate-950 dark:text-white"
                      }`}
                    >
                      {money(account.balanceCents)}
                    </p>
                  </div>
                ))}

                {accounts.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-950 sm:col-span-3">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      No accounts yet.
                    </p>

                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      Start by creating a checking, savings, cash, or credit
                      card account.
                    </p>

                    <Link
                      to="/accounts"
                      className="mt-4 inline-flex rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
                    >
                      Create account
                    </Link>
                  </div>
                )}
              </div>
            </Card>

            <FreeSpendingCard
              limitCents={freeSpendingLimitCents}
              usedCents={freeSpendingUsedCents}
            />
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Income This Month
                  </p>

                  <p className="mt-3 text-2xl font-semibold text-emerald-600">
                    {money(incomeThisMonthCents)}
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                  <TrendingUp size={22} />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Expenses This Month
                  </p>

                  <p className="mt-3 text-2xl font-semibold text-red-600">
                    {money(expensesThisMonthCents)}
                  </p>
                </div>

                <div className="rounded-2xl bg-red-50 p-3 text-red-600 dark:bg-red-950/30 dark:text-red-400">
                  <TrendingDown size={22} />
                </div>
              </div>
            </Card>

            <Card className="md:col-span-2">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Upcoming Bills
              </p>

              <div className="mt-4 space-y-3">
                {upcomingBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {bill.name}
                      </p>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Due {formatBillDate(bill.billDate)}
                      </p>
                    </div>

                    <p className="text-sm font-semibold text-slate-950 dark:text-white">
                      {money(bill.amountCents)}
                    </p>
                  </div>
                ))}

                {upcomingBills.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center dark:border-slate-700 dark:bg-slate-950">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      No upcoming bills for the rest of this month.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="mt-5">
            <SpendingChart data={spendingChartData} />
          </div>
        </>
      )}
    </div>
  );
}