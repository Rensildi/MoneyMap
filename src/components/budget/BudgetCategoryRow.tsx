import { useEffect, useState } from "react";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import type { Category } from "../../types/category";
import { dollarsToCents, formatMoney } from "../../lib/formatMoney";
import { ProgressBar } from "../ui/ProgressBar";

type BudgetCategoryRowProps = {
  category: Category;
  spentCents: number;
  budgetedCents: number;
  onUpdateBudget: (categoryId: string, budgetedCents: number) => void;
};

export function BudgetCategoryRow({
  category,
  spentCents,
  budgetedCents,
  onUpdateBudget,
}: BudgetCategoryRowProps) {
  const [budgetInput, setBudgetInput] = useState(
    String(budgetedCents / 100),
  );

  useEffect(() => {
    setBudgetInput(String(budgetedCents / 100));
  }, [budgetedCents]);

  const remainingCents = budgetedCents - spentCents;
  const percentUsed =
    budgetedCents > 0 ? Math.round((spentCents / budgetedCents) * 100) : 0;

  const isOverBudget = percentUsed > 100;
  const isWarning = percentUsed >= 80 && percentUsed <= 100;

  const tone = isOverBudget ? "danger" : isWarning ? "warning" : "success";

  function handleSaveBudget() {
    const nextBudgetCents = dollarsToCents(budgetInput);

    if (nextBudgetCents < 0) {
      return;
    }

    onUpdateBudget(category.id, nextBudgetCents);
  }

  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-200/60 backdrop-blur">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-950">{category.name}</h3>

            {category.countsTowardFreeSpending && (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                Free spending
              </span>
            )}

            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                isOverBudget
                  ? "bg-red-50 text-red-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {isOverBudget ? (
                <TriangleAlert size={13} />
              ) : (
                <CheckCircle2 size={13} />
              )}
              {isOverBudget ? "Over budget" : "On track"}
            </span>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-500">
                {formatMoney(spentCents)} spent
              </span>
              <span className={isOverBudget ? "text-red-600" : "text-slate-500"}>
                {percentUsed}%
              </span>
            </div>

            <ProgressBar value={percentUsed} tone={tone} />
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <span className="text-slate-500">
              Budget:{" "}
              <strong className="font-semibold text-slate-800">
                {formatMoney(budgetedCents)}
              </strong>
            </span>

            <span className={remainingCents < 0 ? "text-red-600" : "text-slate-500"}>
              Remaining:{" "}
              <strong className="font-semibold">
                {formatMoney(remainingCents)}
              </strong>
            </span>
          </div>
        </div>

        <div className="w-full lg:w-40">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Monthly limit
          </label>

          <input
            value={budgetInput}
            onChange={(event) => setBudgetInput(event.target.value)}
            onBlur={handleSaveBudget}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSaveBudget();
                event.currentTarget.blur();
              }
            }}
            inputMode="decimal"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-slate-950"
          />
        </div>
      </div>
    </div>
  );
}