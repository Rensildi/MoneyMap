import {
  Banknote,
  CircleDollarSign,
  CreditCard,
  Landmark,
  Pencil,
  PiggyBank,
  Trash2,
  TrendingUp,
} from "lucide-react";
import type { Account } from "../../types/account";
import { formatMoney } from "../../lib/formatMoney";

type AccountCardProps = {
  account: Account;
  onEditAccount?: (account: Account) => void;
  onDeleteAccount?: (accountId: string) => void;
};

const accountTypeLabels = {
  checking: "Checking",
  savings: "Savings",
  cash: "Cash",
  credit_card: "Credit Card",
  loan: "Loan",
  investment: "Investment",
};

const accountTypeIcons = {
  checking: Landmark,
  savings: PiggyBank,
  cash: Banknote,
  credit_card: CreditCard,
  loan: CircleDollarSign,
  investment: TrendingUp,
};

export function AccountCard({ account, onEditAccount, onDeleteAccount }: AccountCardProps) {
  const Icon = accountTypeIcons[account.type];

  const isDebtAccount =
    account.type === "credit_card" || account.type === "loan";

  return (
    <div className="group rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-xl shadow-slate-200/70 backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
              isDebtAccount
                ? "bg-red-50 text-red-600"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            <Icon size={23} />
          </div>

          <div>
            <p className="font-semibold text-slate-950">{account.name}</p>
            <p className="text-sm text-slate-500">
              {accountTypeLabels[account.type]}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isDebtAccount
                ? "bg-red-50 text-red-600"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            Saved
          </span>

          {onEditAccount && (
            <button
              type="button"
              onClick={() => onEditAccount(account)}
              className="rounded-2xl p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
              aria-label="Edit account"
              title="Edit account"
            >
              <Pencil size={18} />
            </button>
          )}

          {onDeleteAccount && (
            <button
              type="button"
              onClick={() => {
                const confirmed = window.confirm(
                  `Delete ${account.name}? This cannot be undone.`,
                );

                if (confirmed) {
                  onDeleteAccount(account.id);
                }
              }}
              className="rounded-2xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              aria-label="Delete account"
              title="Delete account"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-8">
        <p className="text-sm font-medium text-slate-500">Current Balance</p>
        <p
          className={`mt-2 text-3xl font-semibold tracking-tight ${
            account.balanceCents < 0 ? "text-red-600" : "text-slate-950"
          }`}
        >
          {formatMoney(account.balanceCents)}
        </p>
      </div>
    </div>
  );
}