import { useState } from "react";
import {
  Car,
  Home,
  Plane,
  ShieldCheck,
  Target,
  Trash2,
  WalletCards,
} from "lucide-react";
import type { Goal, GoalType } from "../../types/goal";
import { dollarsToCents, formatMoney } from "../../lib/formatMoney";
import { ProgressBar } from "../ui/ProgressBar";

type GoalCardProps = {
  goal: Goal;
  onAddProgress: (goalId: string, amountCents: number) => void;
  onDeleteGoal: (goalId: string) => void;
};

const goalTypeLabels: Record<GoalType, string> = {
  emergency_fund: "Emergency Fund",
  vacation: "Vacation",
  car: "Car",
  house: "House",
  debt_payoff: "Debt Payoff",
  custom: "Custom",
};

const goalTypeIcons = {
  emergency_fund: ShieldCheck,
  vacation: Plane,
  car: Car,
  house: Home,
  debt_payoff: WalletCards,
  custom: Target,
};

function formatTargetDate(date?: string) {
  if (!date) {
    return "No target date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export function GoalCard({
  goal,
  onAddProgress,
  onDeleteGoal,
}: GoalCardProps) {
  const [progressInput, setProgressInput] = useState("");

  const Icon = goalTypeIcons[goal.type];

  const remainingCents = Math.max(goal.targetCents - goal.currentCents, 0);
  const percentComplete =
    goal.targetCents > 0
      ? Math.min(Math.round((goal.currentCents / goal.targetCents) * 100), 100)
      : 0;

  const isComplete = percentComplete >= 100;
  const isDebtGoal = goal.type === "debt_payoff";

  const tone = isComplete ? "success" : percentComplete >= 75 ? "warning" : "success";

  function handleAddProgress() {
    const amountCents = dollarsToCents(progressInput);

    if (amountCents <= 0) {
      return;
    }

    onAddProgress(goal.id, amountCents);
    setProgressInput("");
  }

  return (
    <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-xl shadow-slate-200/70 backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              isComplete
                ? "bg-emerald-50 text-emerald-600"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            <Icon size={23} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-slate-950">{goal.name}</h3>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                {goalTypeLabels[goal.type]}
              </span>

              {isComplete && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                  Complete
                </span>
              )}
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Target date: {formatTargetDate(goal.targetDate)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const confirmed = window.confirm(
              `Delete ${goal.name}? This cannot be undone.`,
            );

            if (confirmed) {
              onDeleteGoal(goal.id);
            }
          }}
          className="rounded-2xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          aria-label="Delete goal"
          title="Delete goal"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-slate-500">
            {isDebtGoal ? "Paid off" : "Saved"}:{" "}
            <strong className="font-semibold text-slate-800">
              {formatMoney(goal.currentCents)}
            </strong>
          </span>

          <span className="font-semibold text-slate-700">{percentComplete}%</span>
        </div>

        <ProgressBar value={percentComplete} tone={tone} />

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Target
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-950">
              {formatMoney(goal.targetCents)}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Remaining
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-950">
              {formatMoney(remainingCents)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <input
          value={progressInput}
          onChange={(event) => setProgressInput(event.target.value)}
          placeholder={isDebtGoal ? "Payment amount" : "Contribution amount"}
          inputMode="decimal"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950"
        />

        <button
          type="button"
          onClick={handleAddProgress}
          className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200 transition hover:bg-slate-800"
        >
          Add
        </button>
      </div>
    </div>
  );
}