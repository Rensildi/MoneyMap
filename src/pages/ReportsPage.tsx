import { useMemo } from "react";
import { BarChart3, CreditCard, PiggyBank, TrendingUp } from "lucide-react";
import { BillsBreakdownChart } from "../components/reports/BillsBreakdownChart";
import { FreeSpendingUsageChart } from "../components/reports/FreeSpendingUsageChart";
import { GoalProgressChart } from "../components/reports/GoalProgressChart";
import { IncomeExpenseChart } from "../components/reports/IncomeExpenseChart";
import { MonthlyTrendChart } from "../components/reports/MonthlyTrendChart";
import { SpendingByCategoryChart } from "../components/reports/SpendingByCategoryChart";
import { Card } from "../components/ui/Card";
import {
  mockCategories,
  mockFreeSpendingReport,
  mockGoals,
  mockMonthlyReportData,
  mockRecurringBills,
  mockTransactions,
} from "../data/mockData";
import { formatMoney } from "../lib/formatMoney";

export function ReportsPage() {
  const totalIncomeCents = useMemo(() => {
    return mockTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + transaction.amountCents, 0);
  }, []);

  const totalExpensesCents = useMemo(() => {
    return mockTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + transaction.amountCents, 0);
  }, []);

  const monthlyBillsCents = useMemo(() => {
    return mockRecurringBills
      .filter((bill) => bill.isActive)
      .reduce((total, bill) => total + bill.amountCents, 0);
  }, []);

  const totalGoalProgressCents = useMemo(() => {
    return mockGoals.reduce((total, goal) => total + goal.currentCents, 0);
  }, []);

  const cashFlowCents = totalIncomeCents - totalExpensesCents;

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold text-blue-600">Reports</p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Financial insights
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Review spending patterns, income versus expenses, free spending usage,
          recurring bills, and goal progress.
        </p>
      </div>

      <div className="mb-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Cash Flow</p>

              <p
                className={`mt-3 text-2xl font-semibold ${
                  cashFlowCents < 0 ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {formatMoney(cashFlowCents)}
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
                {formatMoney(totalExpensesCents)}
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
                {formatMoney(monthlyBillsCents)}
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
                {formatMoney(totalGoalProgressCents)}
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
          transactions={mockTransactions}
          categories={mockCategories}
        />

        <IncomeExpenseChart
          incomeCents={totalIncomeCents}
          expensesCents={totalExpensesCents}
        />

        <MonthlyTrendChart data={mockMonthlyReportData} />

        <FreeSpendingUsageChart
          limitCents={mockFreeSpendingReport.limitCents}
          usedCents={mockFreeSpendingReport.usedCents}
        />

        <BillsBreakdownChart bills={mockRecurringBills} />

        <GoalProgressChart goals={mockGoals} />
      </div>
    </div>
  );
}