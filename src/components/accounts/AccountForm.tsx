import { useEffect, useState } from "react";
import { Plus, Save } from "lucide-react";
import type { Account, AccountType } from "../../types/account";
import { dollarsToCents } from "../../lib/formatMoney";

type AccountFormProps = {
  initialAccount?: Account | null;
  onSubmitAccount: (account: Account) => void;
  onCancelEdit?: () => void;
};

const accountTypes: { label: string; value: AccountType }[] = [
  { label: "Checking", value: "checking" },
  { label: "Savings", value: "savings" },
  { label: "Cash", value: "cash" },
  { label: "Credit Card", value: "credit_card" },
  { label: "Loan", value: "loan" },
  { label: "Investment", value: "investment" },
];

export function AccountForm({
  initialAccount,
  onSubmitAccount,
  onCancelEdit,
}: AccountFormProps) {
  const isEditing = Boolean(initialAccount);

  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("checking");
  const [balance, setBalance] = useState("");

  useEffect(() => {
    if (!initialAccount) {
      return;
    }

    setName(initialAccount.name);
    setType(initialAccount.type);
    setBalance(String(initialAccount.balanceCents / 100));
  }, [initialAccount]);

  function resetForm() {
    setName("");
    setType("checking");
    setBalance("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    const submittedAccount: Account = {
      id: initialAccount?.id ?? crypto.randomUUID(),
      name: name.trim(),
      type,
      balanceCents: dollarsToCents(balance),
    };

    onSubmitAccount(submittedAccount);

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
          {isEditing ? "Edit Account" : "New Account"}
        </p>

        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          {isEditing ? "Update account" : "Add a manual account"}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {isEditing
            ? "Update the name, type, or current balance for this account."
            : "Create checking, savings, cash, credit card, loan, or investment accounts without linking to a bank."}
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
            Current balance
          </label>

          <input
            value={balance}
            onChange={(event) => setBalance(event.target.value)}
            placeholder="Example: 2500"
            inputMode="decimal"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950"
          />

          <p className="mt-2 text-xs text-slate-400">
            For credit cards or loans, use a negative value like -350.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          {isEditing ? <Save size={18} /> : <Plus size={18} />}
          {isEditing ? "Save account" : "Add account"}
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