import { useEffect, useMemo, useState } from "react";
import { CreditCard, PiggyBank, Target, Wallet } from "lucide-react";
import { BudgetCategoryRow } from "../components/budget/BudgetCategoryRow";
import { FreeSpendingSettings } from "../components/budget/FreeSpendingSettings";
import { Card } from "../components/ui/Card";
import { useAuth } from "../hooks/useAuth";
// import { formatMoney } from "../lib/formatMoney";
import { useMoney } from "../hooks/useMoney";
import {
  fetchFreeSpendingLimit,
  fetchMonthlyBudgets,
  upsertFreeSpendingLimit,
  upsertMonthlyBudget,
} from "../services/budgetService";
import {
  seedDefaultCategoriesIfNeeded,
  updateCategoryFreeSpendingStatus,
} from "../services/categoryService";
import { fetchTransactions } from "../services/transactionService";
import type { MonthlyBudget } from "../types/budget";
import type { Category } from "../types/category";
import type { Transaction } from "../types/transaction";

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function BudgetPage() {
  const { user } = useAuth();
  const { money } = useMoney();

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<MonthlyBudget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [freeSpendingLimitCents, setFreeSpendingLimitCents] = useState(40000);

  const [loading, setLoading] = useState(true);
  const [savingMessage, setSavingMessage] = useState("");
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    async function loadBudgetData() {
      if (!user) {
        return;
      }

      setLoading(true);
      setPageError("");

      try {
        const [
          savedCategories,
          savedTransactions,
          savedBudgets,
          savedFreeSpendingLimit,
        ] = await Promise.all([
          seedDefaultCategoriesIfNeeded(user.id),
          fetchTransactions(user.id),
          fetchMonthlyBudgets(user.id, selectedMonth),
          fetchFreeSpendingLimit(user.id, selectedMonth),
        ]);

        setCategories(savedCategories);
        setTransactions(savedTransactions);
        setBudgets(savedBudgets);
        setFreeSpendingLimitCents(savedFreeSpendingLimit);
      } catch (error) {
        if (error instanceof Error) {
          setPageError(error.message);
        } else {
          setPageError("Could not load budget data.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadBudgetData();
  }, [user, selectedMonth]);

  const expenseCategories = useMemo(() => {
    return categories.filter((category) => category.type === "expense");
  }, [categories]);

  const transactionsForMonth = useMemo(() => {
    return transactions.filter((transaction) =>
      transaction.transactionDate.startsWith(selectedMonth),
    );
  }, [transactions, selectedMonth]);

  const spendingByCategory = useMemo(() => {
    const result: Record<string, number> = {};

    for (const transaction of transactionsForMonth) {
      if (transaction.type !== "expense" || !transaction.categoryId) {
        continue;
      }

      result[transaction.categoryId] =
        (result[transaction.categoryId] ?? 0) + transaction.amountCents;
    }

    return result;
  }, [transactionsForMonth]);

  const totalBudgetedCents = useMemo(() => {
    return budgets.reduce((total, budget) => total + budget.budgetedCents, 0);
  }, [budgets]);

  const totalSpentCents = useMemo(() => {
    return Object.values(spendingByCategory).reduce(
      (total, amount) => total + amount,
      0,
    );
  }, [spendingByCategory]);

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

  const remainingBudgetCents = totalBudgetedCents - totalSpentCents;

  function showSavedMessage(message: string) {
    setSavingMessage(message);

    window.setTimeout(() => {
      setSavingMessage("");
    }, 2200);
  }

  function getBudgetedCents(categoryId: string) {
    const budget = budgets.find((item) => item.categoryId === categoryId);

    return budget?.budgetedCents ?? 0;
  }

  async function handleUpdateBudget(
    categoryId: string,
    budgetedCents: number,
  ) {
    if (!user) {
      return;
    }

    setPageError("");

    try {
      const savedBudget = await upsertMonthlyBudget(
        user.id,
        categoryId,
        selectedMonth,
        budgetedCents,
      );

      setBudgets((currentBudgets) => {
        const existingBudget = currentBudgets.find(
          (budget) => budget.categoryId === categoryId,
        );

        if (!existingBudget) {
          return [...currentBudgets, savedBudget];
        }

        return currentBudgets.map((budget) => {
          if (budget.categoryId === categoryId) {
            return savedBudget;
          }

          return budget;
        });
      });

      showSavedMessage("Budget saved.");
    } catch (error) {
      if (error instanceof Error) {
        setPageError(error.message);
      } else {
        setPageError("Could not save budget.");
      }
    }
  }

  async function handleUpdateFreeSpendingLimit(limitCents: number) {
    if (!user) {
      return;
    }

    setPageError("");

    try {
      const savedLimit = await upsertFreeSpendingLimit(
        user.id,
        selectedMonth,
        limitCents,
      );

      setFreeSpendingLimitCents(savedLimit);
      showSavedMessage("Free spending limit saved.");
    } catch (error) {
      if (error instanceof Error) {
        setPageError(error.message);
      } else {
        setPageError("Could not save free spending limit.");
      }
    }
  }

  async function handleToggleFreeSpendingCategory(categoryId: string) {
    if (!user) {
      return;
    }

    const category = categories.find((item) => item.id === categoryId);

    if (!category) {
      return;
    }

    const nextValue = !category.countsTowardFreeSpending;

    setPageError("");

    try {
      const updatedCategory = await updateCategoryFreeSpendingStatus(
        user.id,
        categoryId,
        nextValue,
      );

      setCategories((currentCategories) =>
        currentCategories.map((item) => {
          if (item.id !== categoryId) {
            return item;
          }

          return updatedCategory;
        }),
      );

      showSavedMessage("Free spending category updated.");
    } catch (error) {
      if (error instanceof Error) {
        setPageError(error.message);
      } else {
        setPageError("Could not update category.");
      }
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-blue-600">Budget</p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Monthly budget control
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Set category budgets, choose what counts as free spending, and save
            your monthly limits in Supabase.
          </p>
        </div>

        <div className="w-full sm:w-48">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Month
          </label>

          <input
            type="month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-medium outline-none transition focus:border-slate-950"
          />
        </div>
      </div>

      {pageError && (
        <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {pageError}
        </div>
      )}

      {savingMessage && (
        <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {savingMessage}
        </div>
      )}

      {loading ? (
        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-10 text-center shadow-xl shadow-slate-200/70 backdrop-blur">
          <p className="font-medium text-slate-600">Loading budget data...</p>
        </div>
      ) : (
        <>
          <div className="mb-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Budgeted
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {money(totalBudgetedCents)}
                  </p>
                </div>

                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                  <Target size={22} />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Spent
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-red-600">
                    {money(totalSpentCents)}
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
                    Budget Remaining
                  </p>
                  <p
                    className={`mt-3 text-2xl font-semibold ${
                      remainingBudgetCents < 0
                        ? "text-red-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {money(remainingBudgetCents)}
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                  <Wallet size={22} />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Free Spending Used
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-amber-600">
                    {money(freeSpendingUsedCents)}
                  </p>
                </div>

                <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                  <PiggyBank size={22} />
                </div>
              </div>
            </Card>
          </div>

          <div className="mb-5">
            <FreeSpendingSettings
              limitCents={freeSpendingLimitCents}
              usedCents={freeSpendingUsedCents}
              categories={categories}
              onUpdateLimit={handleUpdateFreeSpendingLimit}
              onToggleCategory={handleToggleFreeSpendingCategory}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
            <div>
              <Card className="mb-5">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Category Budgets
                  </p>

                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                    Spending limits by category
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Edit the monthly limit for each category. Press Enter or
                    click outside the input to save.
                  </p>
                </div>
              </Card>

              <div className="space-y-3">
                {expenseCategories.map((category) => (
                  <BudgetCategoryRow
                    key={category.id}
                    category={category}
                    spentCents={spendingByCategory[category.id] ?? 0}
                    budgetedCents={getBudgetedCents(category.id)}
                    onUpdateBudget={handleUpdateBudget}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <Card>
                <p className="text-sm font-medium text-slate-500">
                  Budget color rules
                </p>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700">
                    <span className="font-semibold">Green</span>
                    <span>Under 80%</span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3 text-amber-700">
                    <span className="font-semibold">Yellow</span>
                    <span>80%–100%</span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-red-50 px-4 py-3 text-red-700">
                    <span className="font-semibold">Red</span>
                    <span>Over 100%</span>
                  </div>
                </div>
              </Card>

              <Card>
                <p className="text-sm font-medium text-slate-500">
                  Supabase status
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Category budgets, free spending limits, and free-spending
                  category toggles are now saved in your database.
                </p>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}