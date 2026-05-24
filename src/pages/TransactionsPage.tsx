import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowRightLeft,
  ArrowUpRight,
  ReceiptText,
} from "lucide-react";
import { TransactionForm } from "../components/transactions/TransactionForm";
import { TransactionItem } from "../components/transactions/TransactionItem";
import { Card } from "../components/ui/Card";
import {
  mockAccounts,
  mockCategories,
  mockTransactions,
} from "../data/mockData";
import { formatMoney } from "../lib/formatMoney";
import type { Account } from "../types/account";
import type { Transaction, TransactionType } from "../types/transaction";

type FilterType = "all" | TransactionType;

const filters: { label: string; value: FilterType }[] = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Income",
    value: "income",
  },
  {
    label: "Expenses",
    value: "expense",
  },
  {
    label: "Transfers",
    value: "transfer",
  },
];

export function TransactionsPage() {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [transactions, setTransactions] =
    useState<Transaction[]>(mockTransactions);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((transaction) => {
        if (activeFilter === "all") {
          return true;
        }

        return transaction.type === activeFilter;
      })
      .sort((a, b) => {
        return (
          new Date(b.transactionDate).getTime() -
          new Date(a.transactionDate).getTime()
        );
      });
  }, [transactions, activeFilter]);

  const totalIncomeCents = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + transaction.amountCents, 0);
  }, [transactions]);

  const totalExpenseCents = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + transaction.amountCents, 0);
  }, [transactions]);

  const totalTransferCents = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.type === "transfer")
      .reduce((total, transaction) => total + transaction.amountCents, 0);
  }, [transactions]);

  function updateAccountBalances(transaction: Transaction) {
    setAccounts((currentAccounts) => {
      return currentAccounts.map((account) => {
        if (transaction.type === "income") {
          if (account.id !== transaction.accountId) {
            return account;
          }

          return {
            ...account,
            balanceCents: account.balanceCents + transaction.amountCents,
          };
        }

        if (transaction.type === "expense") {
          if (account.id !== transaction.accountId) {
            return account;
          }

          return {
            ...account,
            balanceCents: account.balanceCents - transaction.amountCents,
          };
        }

        if (transaction.type === "transfer") {
          if (account.id === transaction.accountId) {
            return {
              ...account,
              balanceCents: account.balanceCents - transaction.amountCents,
            };
          }

          if (account.id === transaction.transferAccountId) {
            return {
              ...account,
              balanceCents: account.balanceCents + transaction.amountCents,
            };
          }

          return account;
        }

        return account;
      });
    });
  }

  function handleCreateTransaction(transaction: Transaction) {
    setTransactions((currentTransactions) => [
      transaction,
      ...currentTransactions,
    ]);

    updateAccountBalances(transaction);
  }

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-blue-600">Transactions</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Money activity
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manually add income, expenses, and transfers. Later, these will be
            stored in Supabase and connected to your dashboard.
          </p>
        </div>
      </div>

      <div className="mb-5 grid gap-5 md:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Income
              </p>
              <p className="mt-3 text-2xl font-semibold text-emerald-600">
                {formatMoney(totalIncomeCents)}
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <ArrowUpRight size={22} />
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
                {formatMoney(totalExpenseCents)}
              </p>
            </div>

            <div className="rounded-2xl bg-red-50 p-3 text-red-600">
              <ArrowDownRight size={22} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Transfers
              </p>
              <p className="mt-3 text-2xl font-semibold text-blue-600">
                {formatMoney(totalTransferCents)}
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
              <ArrowRightLeft size={22} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_24rem]">
        <div>
          <Card className="mb-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Transaction History
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                  Recent activity
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setActiveFilter(filter.value)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      activeFilter === filter.value
                        ? "bg-slate-950 text-white shadow-lg shadow-slate-200"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                accounts={accounts}
                categories={mockCategories}
              />
            ))}

            {filteredTransactions.length === 0 && (
              <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/60 p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                  <ReceiptText size={24} />
                </div>

                <p className="mt-4 font-medium text-slate-600">
                  No transactions found.
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Add your first transaction using the form.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <TransactionForm
            accounts={accounts}
            categories={mockCategories}
            onCreateTransaction={handleCreateTransaction}
          />

          <Card>
            <p className="text-sm font-medium text-slate-500">
              Account Balances
            </p>

            <div className="mt-4 space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {account.name}
                    </p>
                    <p className="text-xs capitalize text-slate-500">
                      {account.type.replace("_", " ")}
                    </p>
                  </div>

                  <p
                    className={`text-sm font-semibold ${
                      account.balanceCents < 0
                        ? "text-red-600"
                        : "text-slate-950"
                    }`}
                  >
                    {formatMoney(account.balanceCents)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}