import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import type { Goal, GoalType } from "../../types/goal";
import { dollarsToCents } from "../../lib/formatMoney";

type GoalFormProps = {
  onCreateGoal: (goal: Goal) => void;
};

const goalTypes: { label: string; value: GoalType }[] = [
  {
    label: "Emergency Fund",
    value: "emergency_fund",
  },
  {
    label: "Vacation",
    value: "vacation",
  },
  {
    label: "Car",
    value: "car",
  },
  {
    label: "House",
    value: "house",
  },
  {
    label: "Debt Payoff",
    value: "debt_payoff",
  },
  {
    label: "Custom",
    value: "custom",
  },
];

export function GoalForm({ onCreateGoal }: GoalFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<GoalType>("emergency_fund");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const targetCents = dollarsToCents(targetAmount);
    const currentCents = dollarsToCents(currentAmount);

    if (!name.trim() || targetCents <= 0) {
      return;
    }

    const newGoal: Goal = {
      id: crypto.randomUUID(),
      name: name.trim(),
      type,
      targetCents,
      currentCents: Math.min(currentCents, targetCents),
      targetDate: targetDate || undefined,
      createdAt: new Date().toISOString(),
    };

    onCreateGoal(newGoal);

    setName("");
    setType("emergency_fund");
    setTargetAmount("");
    setCurrentAmount("");
    setTargetDate("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-200/70 backdrop-blur"
    >
      <div>
        <p className="text-sm font-semibold text-blue-600">New Goal</p>

        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          Create a money goal
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Track savings goals, emergency funds, vacations, big purchases, or
          debt payoff progress.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">
            Goal name
          </label>

          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Example: Emergency Fund"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Goal type
          </label>

          <select
            value={type}
            onChange={(event) => setType(event.target.value as GoalType)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
          >
            {goalTypes.map((goalType) => (
              <option key={goalType.value} value={goalType.value}>
                {goalType.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Target amount
          </label>

          <input
            value={targetAmount}
            onChange={(event) => setTargetAmount(event.target.value)}
            placeholder="Example: 5000"
            inputMode="decimal"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Current progress
          </label>

          <input
            value={currentAmount}
            onChange={(event) => setCurrentAmount(event.target.value)}
            placeholder="Example: 1250"
            inputMode="decimal"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950"
          />

          <p className="mt-2 text-xs text-slate-400">
            For debt payoff goals, this means how much you have already paid.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Target date
          </label>

          <input
            type="date"
            value={targetDate}
            onChange={(event) => setTargetDate(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800"
      >
        <Plus size={18} />
        Add goal
      </button>
    </form>
  );
}