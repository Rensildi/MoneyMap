import { useEffect, useState, type FormEvent } from "react";
import { Plus, Save } from "lucide-react";
import type { Account } from "../../types/account";
import type { Bill, BillFrequency } from "../../types/bill";
import type { Category } from "../../types/category";
import { dollarsToCents } from "../../lib/formatMoney";

type BillFormProps = {
  accounts: Account[];
  categories: Category[];
  initialBill?: Bill | null;
  onSubmitBill: (bill: Bill) => void;
  onCancelEdit?: () => void;
};

const frequencyOptions: { label: string; value: BillFrequency }[] = [
  { label: "Monthly", value: "monthly" },
  { label: "Weekly", value: "weekly" },
  { label: "Yearly", value: "yearly" },
];

export function BillForm({
  accounts,
  categories,
  initialBill,
  onSubmitBill,
  onCancelEdit,
}: BillFormProps) {
  const isEditing = Boolean(initialBill);

  const expenseCategories = categories.filter(
    (category) => category.type === "expense",
  );

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("1");
  const [frequency, setFrequency] = useState<BillFrequency>("monthly");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");

  useEffect(() => {
    if (!initialBill) {
      return;
    }

    setName(initialBill.name);
    setAmount(String(initialBill.amountCents / 100));
    setDueDay(String(initialBill.dueDay));
    setFrequency(initialBill.frequency);
    setCategoryId(initialBill.categoryId ?? "");
    setAccountId(initialBill.accountId ?? "");
  }, [initialBill]);

  useEffect(() => {
    if (!initialBill && !categoryId && expenseCategories.length > 0) {
      setCategoryId(expenseCategories[0].id);
    }

    if (!initialBill && !accountId && accounts.length > 0) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, expenseCategories, accountId, categoryId, initialBill]);

  function resetForm() {
    setName("");
    setAmount("");
    setDueDay("1");
    setFrequency("monthly");
    setCategoryId(expenseCategories[0]?.id ?? "");
    setAccountId(accounts[0]?.id ?? "");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amountCents = dollarsToCents(amount);
    const dueDayNumber = Number(dueDay);

    if (!name.trim() || amountCents <= 0) {
      return;
    }

    if (dueDayNumber < 1 || dueDayNumber > 31) {
      return;
    }

    const submittedBill: Bill = {
      id: initialBill?.id ?? crypto.randomUUID(),
      name: name.trim(),
      amountCents,
      categoryId: categoryId || undefined,
      accountId: accountId || undefined,
      dueDay: dueDayNumber,
      frequency,
      isActive: true,
      createdAt: initialBill?.createdAt ?? new Date().toISOString(),
    };

    onSubmitBill(submittedBill);

    if (!isEditing) {
      resetForm();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-200/70 backdrop-blur"
    >
      <div>
        <p className="text-sm font-semibold text-blue-600">
          {isEditing ? "Edit Bill" : "New Bill"}
        </p>

        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          {isEditing ? "Update recurring payment" : "Add recurring payment"}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Track rent, subscriptions, insurance, car payments, and other repeated
          expenses manually.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">
            Bill name
          </label>

          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Example: Netflix"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Amount</label>

          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Example: 16.99"
            inputMode="decimal"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Due day</label>

          <input
            value={dueDay}
            onChange={(event) => setDueDay(event.target.value)}
            placeholder="1"
            inputMode="numeric"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Frequency
          </label>

          <select
            value={frequency}
            onChange={(event) =>
              setFrequency(event.target.value as BillFrequency)
            }
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
          >
            {frequencyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Category
          </label>

          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
          >
            {expenseCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Payment account
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
      </div>

      <div className="mt-6 space-y-3">
        <button
          type="submit"
          disabled={accounts.length === 0}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
        >
          {isEditing ? <Save size={18} /> : <Plus size={18} />}
          {isEditing ? "Save bill" : "Add bill"}
        </button>

        {isEditing && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            Cancel edit
          </button>
        )}
      </div>
    </form>
  );
}