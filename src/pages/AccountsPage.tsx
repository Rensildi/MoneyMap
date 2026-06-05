import { useEffect, useMemo, useRef, useState } from "react";
import { AccountCard } from "../components/accounts/AccountCard";
import { AccountForm } from "../components/accounts/AccountForm";
import { Card } from "../components/ui/Card";
import { useAuth } from "../hooks/useAuth";
// import { formatMoney } from "../lib/formatMoney";
import { useMoney } from "../hooks/useMoney";
import {
  createAccount,
  deleteAccount,
  fetchAccounts,
  updateAccount,
} from "../services/accountService";
import type { Account } from "../types/account";

export function AccountsPage() {
  const { user } = useAuth();
  const { money } = useMoney();
  const formRef = useRef<HTMLDivElement | null>(null);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);


  useEffect(() => {
    async function loadAccounts() {
      if (!user) {
        return;
      }

      setLoading(true);
      setPageError("");

      try {
        const savedAccounts = await fetchAccounts(user.id);
        setAccounts(savedAccounts);
      } catch (error) {
        if (error instanceof Error) {
          setPageError(error.message);
        } else {
          setPageError("Could not load accounts.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadAccounts();
  }, [user]);

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

  async function handleSubmitAccount(account: Account) {
    if (!user || saving) {
      return;
    }

    setSaving(true);
    setPageError("");

    try {
      if (editingAccount) {
        const savedAccount = await updateAccount(user.id, editingAccount.id, {
          name: account.name,
          type: account.type,
          balanceCents: account.balanceCents,
        });

        setAccounts((currentAccounts) =>
          currentAccounts.map((item) => {
            if (item.id !== savedAccount.id) {
              return item;
            }

            return savedAccount;
          }),
        );

        setEditingAccount(null);
      } else {
        const savedAccount = await createAccount(user.id, {
          name: account.name,
          type: account.type,
          balanceCents: account.balanceCents,
        });

        setAccounts((currentAccounts) => [savedAccount, ...currentAccounts]);
      }
    } catch (error) {
      if (error instanceof Error) {
        setPageError(error.message);
      } else {
        setPageError("Could not save account.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount(accountId: string) {
    if (!user) {
      return;
    }

    setPageError("");

    try {
      await deleteAccount(user.id, accountId);

      if (editingAccount?.id === accountId) {
        setEditingAccount(null);
      }

      setAccounts((currentAccounts) =>
        currentAccounts.filter((account) => account.id !== accountId),
      );

    } catch (error) {
      if (error instanceof Error) {
        setPageError(error.message);
      } else {
        setPageError("Could not delete account.");
      }
    }
  }
  function handleEditAccount(account: Account) {
    setEditingAccount(account);

    window.setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
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
            accounts manually. These accounts are now saved in Supabase.
          </p>
        </div>
      </div>

      {pageError && (
        <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {pageError}
        </div>
      )}

      <div className="mb-5 grid gap-5 md:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-slate-500">Total Assets</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {money(totalAssetsCents)}
          </p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-slate-500">Total Debt</p>
          <p className="mt-3 text-2xl font-semibold text-red-600">
            {money(totalDebtCents)}
          </p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-slate-500">Net Worth</p>
          <p
            className={`mt-3 text-2xl font-semibold ${
              netWorthCents < 0 ? "text-red-600" : "text-slate-950"
            }`}
          >
            {money(netWorthCents)}
          </p>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_23rem]">
        <div>
          {loading ? (
            <div className="rounded-[2rem] border border-white/70 bg-white/80 p-10 text-center shadow-xl shadow-slate-200/70 backdrop-blur">
              <p className="font-medium text-slate-600">
                Loading your accounts...
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                {accounts.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    onEditAccount={handleEditAccount}
                    onDeleteAccount={handleDeleteAccount}
                  />
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
            </>
          )}
        </div>

        <div>
          <div ref={formRef}>
            <AccountForm
              initialAccount={editingAccount}
              onSubmitAccount={handleSubmitAccount}
              onCancelEdit={() => setEditingAccount(null)}
            />
          </div>

          {saving && (
            <p className="mt-3 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
              Saving account...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}