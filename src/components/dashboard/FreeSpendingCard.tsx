import { ArrowDownRight, ShieldCheck, TriangleAlert } from "lucide-react";
// import { formatMoney } from "../../lib/formatMoney";
import { useMoney } from "../../hooks/useMoney";
import { ProgressBar } from "../ui/ProgressBar";

type FreeSpendingCardProps = {
  limitCents: number;
  usedCents: number;
};

export function FreeSpendingCard({
  limitCents,
  usedCents,
}: FreeSpendingCardProps) {
  const { money } = useMoney();
  const remainingCents = limitCents - usedCents;
  const percentageUsed = limitCents > 0 ? (usedCents / limitCents) * 100 : 0;

  const isOverLimit = percentageUsed > 100;
  const isWarning = percentageUsed >= 75 && percentageUsed <= 100;

  const tone = isOverLimit ? "danger" : isWarning ? "warning" : "success";

  const statusLabel = isOverLimit
    ? "Over your free spending limit"
    : isWarning
      ? "Getting close to your limit"
      : "You are spending safely";

  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] p-6 shadow-xl ${
        isOverLimit
          ? "border border-red-200 bg-red-50 text-red-950 shadow-red-100"
          : "border border-white/70 bg-slate-950 text-white shadow-slate-300"
      }`}
    >
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p
            className={`text-sm font-medium ${
              isOverLimit ? "text-red-700" : "text-slate-300"
            }`}
          >
            Free Spending
          </p>

          <h2 className="mt-3 text-4xl font-semibold tracking-tight">
            {money(remainingCents)}
          </h2>

          <p
            className={`mt-2 text-sm ${
              isOverLimit ? "text-red-700" : "text-slate-300"
            }`}
          >
            left from {money(limitCents)} this month
          </p>
        </div>

        <div
          className={`rounded-2xl p-3 ${
            isOverLimit ? "bg-red-100 text-red-600" : "bg-white/10 text-white"
          }`}
        >
          {isOverLimit ? <TriangleAlert size={24} /> : <ShieldCheck size={24} />}
        </div>
      </div>

      <div className="relative mt-8">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className={isOverLimit ? "text-red-700" : "text-slate-300"}>
            {money(usedCents)} used
          </span>
          <span className={isOverLimit ? "text-red-700" : "text-slate-300"}>
            {Math.round(percentageUsed)}%
          </span>
        </div>

        <ProgressBar value={percentageUsed} tone={tone} />

        <div
          className={`mt-4 flex items-center gap-2 text-sm font-medium ${
            isOverLimit ? "text-red-700" : "text-slate-200"
          }`}
        >
          <ArrowDownRight size={17} />
          {statusLabel}
        </div>
      </div>
    </div>
  );
}