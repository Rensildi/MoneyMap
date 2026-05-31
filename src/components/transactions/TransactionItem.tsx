import {
  ArrowDownRight,
  ArrowRightLeft,
  ArrowUpRight,
  CalendarDays,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Account } from "../../types/account";
import type { Category } from "../../types/category";
import type { Transaction } from "../../types/transaction";
import { formatMoney } from "../../lib/formatMoney";

type TransactionItemProps = {
  transaction: Transaction;
  accounts: Account[];
  categories: Category[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (transactionId: string) => void;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export function TransactionItem({
  transaction,
  accounts,
  categories,
  onEditTransaction,
  onDeleteTransaction,
}: TransactionItemProps) {
  const account = accounts.find((item) => item.id === transaction.accountId);
  const transferAccount = accounts.find(
    (item) => item.id === transaction.transferAccountId,
  );
  const category = categories.find((item) => item.id === transaction.categoryId);

  const isIncome = transaction.type === "income";
  const isExpense = transaction.type === "expense";
  const isTransfer = transaction.type === "transfer";

  const Icon = isIncome
    ? ArrowUpRight
    : isExpense
      ? ArrowDownRight
      : ArrowRightLeft;

  const iconClass = isIncome
    ? "bg-emerald-50 text-emerald-600"
    : isExpense
      ? "bg-red-50 text-red-600"
      : "bg-blue-50 text-blue-600";

  const amountClass = isIncome
    ? "text-emerald-600"
    : isExpense
      ? "text-red-600"
      : "text-blue-600";

  const sign = isIncome ? "+" : isExpense ? "-" : "";

  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-lg shadow-slate-200/60 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
          >
            <Icon size={22} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-slate-950">
                {transaction.merchant || "Manual Transaction"}
              </p>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold capitalize text-slate-500">
                {transaction.type}
              </span>

              {category?.countsTowardFreeSpending && (
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                  Free spending
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
              <span>
                {isTransfer
                  ? `${account?.name ?? "Unknown"} → ${
                      transferAccount?.name ?? "Unknown"
                    }`
                  : account?.name ?? "Unknown account"}
              </span>

              {category && <span>· {category.name}</span>}

              <span className="inline-flex items-center gap-1">
                <CalendarDays size={14} />
                {formatDate(transaction.transactionDate)}
              </span>
            </div>

            {transaction.notes && (
              <p className="mt-2 text-sm text-slate-400">
                {transaction.notes}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
          <p className={`text-right text-lg font-semibold ${amountClass}`}>
            {sign}
            {formatMoney(transaction.amountCents)}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEditTransaction(transaction)}
              className="rounded-2xl p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
              title="Edit transaction"
              aria-label="Edit transaction"
            >
              <Pencil size={17} />
            </button>

            <button
              type="button"
              onClick={() => {
                const confirmed = window.confirm(
                  "Delete this transaction? Money Map will reverse its balance effect.",
                );

                if (confirmed) {
                  onDeleteTransaction(transaction.id);
                }
              }}
              className="rounded-2xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              title="Delete transaction"
              aria-label="Delete transaction"
            >
              <Trash2 size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}