import { useState } from "react";
import { Plus } from "lucide-react";
import type { Account, AccountType } from "../../types/account";
import { dollarsToCents } from "../../lib/formatMoney";

type AccountFormProps = {
  onCreateAccount: (account: Account) => void;
};

const accountTypes: { label: string; value: AccountType }[] = [
  {
    label: "Checking",
    value: "checking",
  },
  {
    label: "Savings",
    value: "savings",
  },
  {
    label: "Cash",
    value: "cash",
  },
  {
    label: "Credit Card",
    value: "credit_card",
  },
  {
    label: "Loan",
    value: "loan",
  },
  {
    label: "Investment",
    value: "investment",
  },
];

export function AccountForm({ onCreateAccount }: AccountFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("checking");
  const [startingBalance, setStartingBalance] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    const newAccount: Account = {
      id: crypto.randomUUID(),
      name: name.trim(),
      type,
      balanceCents: dollarsToCents(startingBalance),
    };

    onCreateAccount(newAccount);

    setName("");
    setType("checking");
    setStartingBalance("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-200/70 backdrop-blur"
    >
      <div>
        <p className="text-sm font-semibold text-blue-600">New Account</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          Add a manual account
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Create checking, savings, cash, credit card, loan, or investment
          accounts without linking to a bank.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">
            Account name
          </label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Example: Main Checking"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Account type
          </label>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as AccountType)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
          >
            {accountTypes.map((accountType) => (
              <option key={accountType.value} value={accountType.value}>
                {accountType.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Starting balance
          </label>
          <input
            value={startingBalance}
            onChange={(event) => setStartingBalance(event.target.value)}
            placeholder="Example: 2500"
            inputMode="decimal"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950"
          />
          <p className="mt-2 text-xs text-slate-400">
            For credit cards or loans, use a negative value like -350.
          </p>
        </div>
      </div>

      <button
        type="submit"
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800"
      >
        <Plus size={18} />
        Add account
      </button>
    </form>
  );
}