import { useEffect, useState } from "react";
import { ShieldCheck, TriangleAlert } from "lucide-react";
import type { Category } from "../../types/category";
// import { dollarsToCents, formatMoney } from "../../lib/formatMoney";
import { dollarsToCents } from "../../lib/formatMoney";
import { useMoney } from "../../hooks/useMoney";
import { ProgressBar } from "../ui/ProgressBar";

type FreeSpendingSettingsProps = {
  limitCents: number;
  usedCents: number;
  categories: Category[];
  onUpdateLimit: (limitCents: number) => void;
  onToggleCategory: (categoryId: string) => void;
};

export function FreeSpendingSettings({
  limitCents,
  usedCents,
  categories,
  onUpdateLimit,
  onToggleCategory,
}: FreeSpendingSettingsProps) {
  const [limitInput, setLimitInput] = useState(String(limitCents / 100));

  useEffect(() => {
    setLimitInput(String(limitCents / 100));
  }, [limitCents]);

  const { money } = useMoney();
  const remainingCents = limitCents - usedCents;
  const percentUsed =
    limitCents > 0 ? Math.round((usedCents / limitCents) * 100) : 0;

  const isOverLimit = percentUsed > 100;
  const isWarning = percentUsed >= 75 && percentUsed <= 100;

  const tone = isOverLimit ? "danger" : isWarning ? "warning" : "success";

  const expenseCategories = categories.filter(
    (category) => category.type === "expense",
  );

  function handleSaveLimit() {
    const nextLimitCents = dollarsToCents(limitInput);

    if (nextLimitCents < 0) {
      return;
    }

    onUpdateLimit(nextLimitCents);
  }

  return (
    <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            Free Spending Limit
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Control your flexible spending
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Pick which categories count as free spending. When your spending
            gets close to the limit, the status turns yellow. When you pass it,
            it turns red.
          </p>
        </div>

        <div className="w-full xl:w-56">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Monthly free limit
          </label>

          <div className="mt-2 flex gap-2">
            <input
              value={limitInput}
              onChange={(event) => setLimitInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSaveLimit();
                  event.currentTarget.blur();
                }
              }}
              inputMode="decimal"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-slate-950"
            />

            <button
              type="button"
              onClick={handleSaveLimit}
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <div
        className={`mt-6 rounded-[1.5rem] p-5 ${
          isOverLimit
            ? "bg-red-50 text-red-950"
            : isWarning
              ? "bg-amber-50 text-amber-950"
              : "bg-emerald-50 text-emerald-950"
        }`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              {isOverLimit ? (
                <TriangleAlert size={21} />
              ) : (
                <ShieldCheck size={21} />
              )}

              <p className="font-semibold">
                {isOverLimit
                  ? "You passed your free spending limit"
                  : isWarning
                    ? "You are getting close to your limit"
                    : "You are spending safely"}
              </p>
            </div>

            <p className="mt-2 text-sm opacity-80">
              {money(usedCents)} used from {money(limitCents)}.
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-sm opacity-80">Remaining</p>
            <p className="mt-1 text-2xl font-semibold">
              {money(remainingCents)}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-sm opacity-80">
            <span>Progress</span>
            <span>{percentUsed}%</span>
          </div>

          <ProgressBar value={percentUsed} tone={tone} />
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold text-slate-800">
          Categories that count toward free spending
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {expenseCategories.map((category) => {
            const isActive = category.countsTowardFreeSpending;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onToggleCategory(category.id)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                  isActive
                    ? "border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-200"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span>{category.name}</span>
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                      isActive
                        ? "bg-white/15 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isActive ? "On" : "Off"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}