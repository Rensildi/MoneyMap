import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Pencil,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import type { Account } from "../../types/account";
import type { Bill } from "../../types/bill";
import type { Category } from "../../types/category";
// import { formatMoney } from "../../lib/formatMoney";
import { useMoney } from "../../hooks/useMoney";

type BillCardProps = {
  bill: Bill;
  category?: Category;
  account?: Account;
  selectedMonth: string;
  isPaid: boolean;
  onEditBill: (bill: Bill) => void;
  onTogglePaid: (billId: string) => void;
  onDeleteBill: (billId: string) => void;
};

function getBillDate(month: string, dueDay: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const lastDayOfMonth = new Date(year, monthNumber, 0).getDate();
  const safeDueDay = Math.min(dueDay, lastDayOfMonth);

  return new Date(year, monthNumber - 1, safeDueDay);
}

function formatBillDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
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

export function BillCard({
  bill,
  category,
  account,
  selectedMonth,
  isPaid,
  onEditBill,
  onTogglePaid,
  onDeleteBill,
}: BillCardProps) {
  const { money } = useMoney();
  const billDate = getBillDate(selectedMonth, bill.dueDay);
  const daysUntil = getDaysUntil(billDate);

  const isOverdue = !isPaid && daysUntil < 0;
  const isDueToday = !isPaid && daysUntil === 0;
  const isDueSoon = !isPaid && daysUntil > 0 && daysUntil <= 7;

  const statusLabel = isPaid
    ? "Paid"
    : isOverdue
      ? "Overdue"
      : isDueToday
        ? "Due today"
        : isDueSoon
          ? `Due in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`
          : "Upcoming";

  const statusClass = isPaid
    ? "bg-emerald-50 text-emerald-700"
    : isOverdue || isDueToday
      ? "bg-red-50 text-red-700"
      : isDueSoon
        ? "bg-amber-50 text-amber-700"
        : "bg-blue-50 text-blue-700";

  const iconClass = isPaid
    ? "bg-emerald-50 text-emerald-600"
    : isOverdue || isDueToday
      ? "bg-red-50 text-red-600"
      : isDueSoon
        ? "bg-amber-50 text-amber-600"
        : "bg-blue-50 text-blue-600";

  const StatusIcon = isPaid
    ? CheckCircle2
    : isOverdue || isDueToday
      ? TriangleAlert
      : isDueSoon
        ? Clock3
        : CalendarClock;

  return (
    <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-xl shadow-slate-200/70 backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
          >
            <StatusIcon size={23} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-slate-950">{bill.name}</h3>

              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass}`}
              >
                {statusLabel}
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Due {formatBillDate(billDate)} · {bill.frequency}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {category && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                  {category.name}
                </span>
              )}

              {account && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                  {account.name}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEditBill(bill)}
            className="rounded-2xl p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
            aria-label="Edit bill"
            title="Edit bill"
          >
            <Pencil size={18} />
          </button>

          <button
            type="button"
            onClick={() => {
              const confirmed = window.confirm(
                `Delete ${bill.name}? This cannot be undone.`,
              );

              if (confirmed) {
                onDeleteBill(bill.id);
              }
            }}
            className="rounded-2xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            aria-label="Delete bill"
            title="Delete bill"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="mt-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Amount</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
            {money(bill.amountCents)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onTogglePaid(bill.id)}
          className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            isPaid
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "bg-slate-950 text-white shadow-lg shadow-slate-200 hover:bg-slate-800"
          }`}
        >
          {isPaid ? "Mark unpaid" : "Mark paid"}
        </button>
      </div>
    </div>
  );
}