import { useMemo, useState } from "react";
import { AccountCard } from "../components/accounts/AccountCard";
import { AccountForm } from "../components/accounts/AccountForm";
import { Card } from "../components/ui/Card";
import { mockAccounts } from "../data/mockData";
import { formatMoney } from "../lib/formatMoney";
import type { Account } from "../types/account";

export function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);

  const totalAssetsCents = useMemo(() => {
    return accounts
      .filter((account) => account.balanceCents > 0)
      .reduce((total, account) => total + account.balanceCents, 0);
  }, [accounts]);

  const totalDebtCents = useMemo(() => {
    return accounts
      .filter((account) => account.balanceCents < 0)
      .reduce((total, account) => total + account.balanceCents, 0);
  }, [accounts]);

  const netWorthCents = totalAssetsCents + totalDebtCents;

  function handleCreateAccount(account: Account) {
    setAccounts((currentAccounts) => [account, ...currentAccounts]);
  }

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-blue-600">Accounts</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Manual money accounts
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Add your checking, savings, cash, credit card, loan, or investment
            accounts manually. No bank connection needed.
          </p>
        </div>
      </div>

      <div className="mb-5 grid gap-5 md:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-slate-500">Total Assets</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {formatMoney(totalAssetsCents)}
          </p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-slate-500">Total Debt</p>
          <p className="mt-3 text-2xl font-semibold text-red-600">
            {formatMoney(totalDebtCents)}
          </p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-slate-500">Net Worth</p>
          <p
            className={`mt-3 text-2xl font-semibold ${
              netWorthCents < 0 ? "text-red-600" : "text-slate-950"
            }`}
          >
            {formatMoney(netWorthCents)}
          </p>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_23rem]">
        <div>
          <div className="grid gap-5 md:grid-cols-2">
            {accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>

          {accounts.length === 0 && (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/60 p-10 text-center">
              <p className="font-medium text-slate-600">
                You do not have any accounts yet.
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Add your first account using the form.
              </p>
            </div>
          )}
        </div>

        <AccountForm onCreateAccount={handleCreateAccount} />
      </div>
    </div>
  );
}