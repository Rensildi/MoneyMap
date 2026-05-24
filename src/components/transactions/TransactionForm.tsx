import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowDownRight, ArrowRightLeft, ArrowUpRight, Plus } from "lucide-react";
import type { Account } from "../../types/account";
import type { Category } from "../../types/category";
import type {
  Transaction,
  TransactionType,
} from "../../types/transaction";
import { dollarsToCents } from "../../lib/formatMoney";

type TransactionFormProps = {
  accounts: Account[];
  categories: Category[];
  onCreateTransaction: (transaction: Transaction) => void;
};

const transactionTypes: {
  label: string;
  value: TransactionType;
  icon: typeof ArrowUpRight;
}[] = [
  {
    label: "Income",
    value: "income",
    icon: ArrowUpRight,
  },
  {
    label: "Expense",
    value: "expense",
    icon: ArrowDownRight,
  },
  {
    label: "Transfer",
    value: "transfer",
    icon: ArrowRightLeft,
  },
];

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionForm({
  accounts,
  categories,
  onCreateTransaction,
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [transferAccountId, setTransferAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [merchant, setMerchant] = useState("");
  const [transactionDate, setTransactionDate] = useState(getTodayDate());
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!accountId && accounts.length > 0) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  const availableCategories = useMemo(() => {
    return categories.filter((category) => category.type === type);
  }, [categories, type]);

  function handleTypeChange(nextType: TransactionType) {
    setType(nextType);
    setCategoryId("");
    setTransferAccountId("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amountCents = dollarsToCents(amount);

    if (amountCents <= 0 || !accountId) {
      return;
    }

    if (type === "transfer") {
      if (!transferAccountId || transferAccountId === accountId) {
        return;
      }
    }

    if (type !== "transfer" && !categoryId) {
      return;
    }

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      type,
      amountCents,
      accountId,
      transferAccountId: type === "transfer" ? transferAccountId : undefined,
      categoryId: type !== "transfer" ? categoryId : undefined,
      merchant:
        merchant.trim() ||
        (type === "transfer" ? "Account Transfer" : "Manual Transaction"),
      transactionDate,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onCreateTransaction(newTransaction);

    setAmount("");
    setCategoryId("");
    setTransferAccountId("");
    setMerchant("");
    setNotes("");
    setTransactionDate(getTodayDate());
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-200/70 backdrop-blur"
    >
      <div>
        <p className="text-sm font-semibold text-blue-600">New Transaction</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          Add money movement
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Add income, expenses, or transfers between your manual accounts.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1">
        {transactionTypes.map((transactionType) => {
          const Icon = transactionType.icon;
          const isActive = type === transactionType.value;

          return (
            <button
              key={transactionType.value}
              type="button"
              onClick={() => handleTypeChange(transactionType.value)}
              className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                isActive
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500 hover:text-slate-950"
              }`}
            >
              <Icon size={16} />
              {transactionType.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Amount</label>
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Example: 45.25"
            inputMode="decimal"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            {type === "transfer" ? "From account" : "Account"}
          </label>
          <select
            value={accountId}
            onChange={(event) => setAccountId(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>

        {type === "transfer" && (
          <div>
            <label className="text-sm font-medium text-slate-700">
              To account
            </label>
            <select
              value={transferAccountId}
              onChange={(event) => setTransferAccountId(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
            >
              <option value="">Select destination account</option>
              {accounts
                .filter((account) => account.id !== accountId)
                .map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        {type !== "transfer" && (
          <div>
            <label className="text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
            >
              <option value="">Select category</option>
              {availableCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  {category.countsTowardFreeSpending
                    ? " · Free spending"
                    : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-700">
            {type === "income"
              ? "Source"
              : type === "expense"
                ? "Merchant"
                : "Transfer name"}
          </label>
          <input
            value={merchant}
            onChange={(event) => setMerchant(event.target.value)}
            placeholder={
              type === "income"
                ? "Example: Paycheck"
                : type === "expense"
                  ? "Example: Chipotle"
                  : "Example: Transfer to savings"
            }
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Date</label>
          <input
            type="date"
            value={transactionDate}
            onChange={(event) => setTransactionDate(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Notes</label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Optional note"
            rows={3}
            className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={accounts.length === 0}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Plus size={18} />
        Add transaction
      </button>
    </form>
  );
}