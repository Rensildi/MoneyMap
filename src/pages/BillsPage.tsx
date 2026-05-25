import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  DollarSign,
  TriangleAlert,
} from "lucide-react";
import { BillCard } from "../components/bills/BillCard";
import { BillForm } from "../components/bills/BillForm";
import { Card } from "../components/ui/Card";
import { useAuth } from "../hooks/useAuth";
// import { formatMoney } from "../lib/formatMoney";
import { useMoney } from "../hooks/useMoney";
import { fetchAccounts } from "../services/accountService";
import {
  createBill,
  deleteBill,
  fetchBills,
  fetchPaidBillIdsForMonth,
  markBillPaid,
  markBillUnpaid,
  updateBill,
} from "../services/billService";
import { seedDefaultCategoriesIfNeeded } from "../services/categoryService";
import type { Account } from "../types/account";
import type { Bill } from "../types/bill";
import type { Category } from "../types/category";

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function getBillDate(month: string, dueDay: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const lastDayOfMonth = new Date(year, monthNumber, 0).getDate();
  const safeDueDay = Math.min(dueDay, lastDayOfMonth);

  return new Date(year, monthNumber - 1, safeDueDay);
}

function getDaysUntil(date: Date) {
  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const targetStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  return Math.ceil(
    (targetStart.getTime() - todayStart.getTime()) / millisecondsPerDay,
  );
}

export function BillsPage() {
  const { user } = useAuth();
  const { money } = useMoney();

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [bills, setBills] = useState<Bill[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paidBillIds, setPaidBillIds] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);
  const [savingMessage, setSavingMessage] = useState("");
  const [pageError, setPageError] = useState("");
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  useEffect(() => {
    async function loadBillsData() {
      if (!user) {
        return;
      }

      setLoading(true);
      setPageError("");

      try {
        const [
          savedAccounts,
          savedCategories,
          savedBills,
          savedPaidBillIds,
        ] = await Promise.all([
          fetchAccounts(user.id),
          seedDefaultCategoriesIfNeeded(user.id),
          fetchBills(user.id),
          fetchPaidBillIdsForMonth(user.id, selectedMonth),
        ]);

        setAccounts(savedAccounts);
        setCategories(savedCategories);
        setBills(savedBills);
        setPaidBillIds(savedPaidBillIds);
      } catch (error) {
        if (error instanceof Error) {
          setPageError(error.message);
        } else {
          setPageError("Could not load bills data.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadBillsData();
  }, [user, selectedMonth]);

  const activeBills = useMemo(() => {
    return bills.filter((bill) => bill.isActive);
  }, [bills]);

  const sortedBills = useMemo(() => {
    return [...activeBills].sort((a, b) => a.dueDay - b.dueDay);
  }, [activeBills]);

  const monthlyBillsTotalCents = useMemo(() => {
    return activeBills.reduce((total, bill) => total + bill.amountCents, 0);
  }, [activeBills]);

  const paidTotalCents = useMemo(() => {
    return activeBills
      .filter((bill) => paidBillIds.has(bill.id))
      .reduce((total, bill) => total + bill.amountCents, 0);
  }, [activeBills, paidBillIds]);

  const unpaidTotalCents = monthlyBillsTotalCents - paidTotalCents;

  const overdueBillsCount = useMemo(() => {
    return activeBills.filter((bill) => {
      const billDate = getBillDate(selectedMonth, bill.dueDay);
      const daysUntil = getDaysUntil(billDate);

      return !paidBillIds.has(bill.id) && daysUntil < 0;
    }).length;
  }, [activeBills, selectedMonth, paidBillIds]);

  const dueSoonBillsCount = useMemo(() => {
    return activeBills.filter((bill) => {
      const billDate = getBillDate(selectedMonth, bill.dueDay);
      const daysUntil = getDaysUntil(billDate);

      return !paidBillIds.has(bill.id) && daysUntil >= 0 && daysUntil <= 7;
    }).length;
  }, [activeBills, selectedMonth, paidBillIds]);

  function showSavedMessage(message: string) {
    setSavingMessage(message);

    window.setTimeout(() => {
      setSavingMessage("");
    }, 2200);
  }

  async function handleSubmitBill(bill: Bill) {
    if (!user) {
      return;
    }

    setPageError("");

    try {
      if (editingBill) {
        const savedBill = await updateBill(user.id, editingBill.id, {
          name: bill.name,
          amountCents: bill.amountCents,
          categoryId: bill.categoryId,
          accountId: bill.accountId,
          dueDay: bill.dueDay,
          frequency: bill.frequency,
        });

        setBills((currentBills) =>
          currentBills.map((item) => {
            if (item.id !== savedBill.id) {
              return item;
            }

            return savedBill;
          }),
        );

        setEditingBill(null);
        showSavedMessage("Bill updated.");
      } else {
        const savedBill = await createBill(user.id, {
          name: bill.name,
          amountCents: bill.amountCents,
          categoryId: bill.categoryId,
          accountId: bill.accountId,
          dueDay: bill.dueDay,
          frequency: bill.frequency,
        });

        setBills((currentBills) => [savedBill, ...currentBills]);
        showSavedMessage("Bill saved.");
      }
    } catch (error) {
      if (error instanceof Error) {
        setPageError(error.message);
      } else {
        setPageError("Could not save bill.");
      }
    }
  }

  async function handleTogglePaid(billId: string) {
    if (!user) {
      return;
    }

    setPageError("");

    const isCurrentlyPaid = paidBillIds.has(billId);

    try {
      if (isCurrentlyPaid) {
        await markBillUnpaid(user.id, billId, selectedMonth);

        setPaidBillIds((currentPaidBillIds) => {
          const nextPaidBillIds = new Set(currentPaidBillIds);
          nextPaidBillIds.delete(billId);
          return nextPaidBillIds;
        });

        showSavedMessage("Bill marked unpaid.");
      } else {
        await markBillPaid(user.id, billId, selectedMonth);

        setPaidBillIds((currentPaidBillIds) => {
          const nextPaidBillIds = new Set(currentPaidBillIds);
          nextPaidBillIds.add(billId);
          return nextPaidBillIds;
        });

        showSavedMessage("Bill marked paid.");
      }
    } catch (error) {
      if (error instanceof Error) {
        setPageError(error.message);
      } else {
        setPageError("Could not update bill payment status.");
      }
    }
  }

  async function handleDeleteBill(billId: string) {
    if (!user) {
      return;
    }

    setPageError("");

    try {
      await deleteBill(user.id, billId);

      if (editingBill?.id === billId) {
        setEditingBill(null);
      }

      setBills((currentBills) =>
        currentBills.filter((bill) => bill.id !== billId),
      );

      setPaidBillIds((currentPaidBillIds) => {
        const nextPaidBillIds = new Set(currentPaidBillIds);
        nextPaidBillIds.delete(billId);
        return nextPaidBillIds;
      });

      showSavedMessage("Bill deleted.");
    } catch (error) {
      if (error instanceof Error) {
        setPageError(error.message);
      } else {
        setPageError("Could not delete bill.");
      }
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            Bills & Subscriptions
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Recurring payments
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Track rent, phone bills, insurance, subscriptions, and other
            recurring expenses. These bills are now saved in Supabase.
          </p>
        </div>

        <div className="w-full rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-lg shadow-slate-200/60 backdrop-blur sm:w-60">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Viewing month
          </label>

          <input
            type="month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-slate-950"
          />
        </div>
      </div>

      {pageError && (
        <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {pageError}
        </div>
      )}

      {savingMessage && (
        <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {savingMessage}
        </div>
      )}

      {loading ? (
        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-10 text-center shadow-xl shadow-slate-200/70 backdrop-blur">
          <p className="font-medium text-slate-600">Loading bills...</p>
        </div>
      ) : (
        <>
          <div className="mb-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Monthly Bills
                  </p>

                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {money(monthlyBillsTotalCents)}
                  </p>
                </div>

                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                  <DollarSign size={22} />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Paid</p>

                  <p className="mt-3 text-2xl font-semibold text-emerald-600">
                    {money(paidTotalCents)}
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                  <CheckCircle2 size={22} />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Unpaid</p>

                  <p className="mt-3 text-2xl font-semibold text-red-600">
                    {money(unpaidTotalCents)}
                  </p>
                </div>

                <div className="rounded-2xl bg-red-50 p-3 text-red-600">
                  <TriangleAlert size={22} />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Due Soon
                  </p>

                  <p className="mt-3 text-2xl font-semibold text-amber-600">
                    {dueSoonBillsCount}
                  </p>
                </div>

                <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                  <CalendarClock size={22} />
                </div>
              </div>

              {overdueBillsCount > 0 && (
                <p className="mt-3 text-xs font-semibold text-red-600">
                  {overdueBillsCount} overdue
                </p>
              )}
            </Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_24rem]">
            <div>
              <Card className="mb-5">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Bill Calendar
                  </p>

                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                    Upcoming recurring expenses
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Mark bills as paid for the selected month. Paid status is
                    saved in the bill_payments table.
                  </p>
                </div>
              </Card>

              <div className="grid gap-4 xl:grid-cols-2">
                {sortedBills.map((bill) => {
                  const category = categories.find(
                    (item) => item.id === bill.categoryId,
                  );

                  const account = accounts.find(
                    (item) => item.id === bill.accountId,
                  );

                  return (
                    <BillCard
                      key={bill.id}
                      bill={bill}
                      category={category}
                      account={account}
                      selectedMonth={selectedMonth}
                      isPaid={paidBillIds.has(bill.id)}
                      onEditBill={setEditingBill}
                      onTogglePaid={handleTogglePaid}
                      onDeleteBill={handleDeleteBill}
                    />
                  );
                })}
              </div>

              {sortedBills.length === 0 && (
                <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/60 p-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <CalendarClock size={24} />
                  </div>

                  <p className="mt-4 font-medium text-slate-600">
                    No recurring bills yet.
                  </p>

                  <p className="mt-2 text-sm text-slate-400">
                    Add rent, subscriptions, insurance, or other repeating
                    expenses.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-5">
              {accounts.length === 0 && (
                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                  Create at least one account before adding bills.
                </div>
              )}

              <BillForm
                accounts={accounts}
                categories={categories}
                initialBill={editingBill}
                onSubmitBill={handleSubmitBill}
                onCancelEdit={() => setEditingBill(null)}
              />

              <Card>
                <p className="text-sm font-medium text-slate-500">
                  Supabase status
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Bills are saved in the bills table. Paid/unpaid status is
                  saved per month in the bill_payments table.
                </p>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}