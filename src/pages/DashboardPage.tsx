import { Plus, TrendingDown, TrendingUp, WalletCards } from "lucide-react";
import {
  mockAccounts,
  mockBills,
  mockFreeSpending,
  mockMonthlySummary,
} from "../data/mockData";
import { formatMoney } from "../lib/formatMoney";
import { FreeSpendingCard } from "../components/dashboard/FreeSpendingCard";
import { SpendingChart } from "../components/dashboard/SpendingChart";
import { Card } from "../components/ui/Card";

export function DashboardPage() {
  const totalBalanceCents = mockAccounts.reduce(
    (total, account) => total + account.balanceCents,
    0,
  );

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-blue-600">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Good morning, Rensildi
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Here is your money snapshot for this month.
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800">
          <Plus size={18} />
          Add transaction
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Balance
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                {formatMoney(totalBalanceCents)}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Across {mockAccounts.length} manual accounts
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
              <WalletCards size={24} />
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {mockAccounts.map((account) => (
              <div
                key={account.id}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {account.type}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {account.name}
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {formatMoney(account.balanceCents)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <FreeSpendingCard
          limitCents={mockFreeSpending.limitCents}
          usedCents={mockFreeSpending.usedCents}
        />
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Income This Month
              </p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">
                {formatMoney(mockMonthlySummary.incomeCents)}
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
                Expenses This Month
              </p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">
                {formatMoney(mockMonthlySummary.expensesCents)}
              </p>
            </div>

            <div className="rounded-2xl bg-red-50 p-3 text-red-600">
              <TrendingDown size={22} />
            </div>
          </div>
        </Card>

        <Card className="md:col-span-2">
          <p className="text-sm font-medium text-slate-500">Upcoming Bills</p>

          <div className="mt-4 space-y-3">
            {mockBills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {bill.name}
                  </p>
                  <p className="text-xs text-slate-500">Due {bill.dueDate}</p>
                </div>

                <p className="text-sm font-semibold text-slate-950">
                  {formatMoney(bill.amountCents)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-5">
        <SpendingChart />
      </div>
    </div>
  );
}