import { ShieldCheck, TriangleAlert } from "lucide-react";
import { formatMoney } from "../../lib/formatMoney";
import { ProgressBar } from "../ui/ProgressBar";
import { ChartCard } from "./ChartCard";

type FreeSpendingUsageChartProps = {
  limitCents: number;
  usedCents: number;
};

export function FreeSpendingUsageChart({
  limitCents,
  usedCents,
}: FreeSpendingUsageChartProps) {
  const remainingCents = limitCents - usedCents;
  const percentUsed =
    limitCents > 0 ? Math.round((usedCents / limitCents) * 100) : 0;

  const isOverLimit = percentUsed > 100;
  const isWarning = percentUsed >= 75 && percentUsed <= 100;

  const tone = isOverLimit ? "danger" : isWarning ? "warning" : "success";

  return (
    <ChartCard
      title="Free spending usage"
      description="How much flexible spending you have left"
    >
      <div
        className={`rounded-[1.5rem] p-6 ${
          isOverLimit
            ? "bg-red-50 text-red-950"
            : isWarning
              ? "bg-amber-50 text-amber-950"
              : "bg-emerald-50 text-emerald-950"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              {isOverLimit ? (
                <TriangleAlert size={22} />
              ) : (
                <ShieldCheck size={22} />
              )}

              <p className="font-semibold">
                {isOverLimit
                  ? "Over free spending limit"
                  : isWarning
                    ? "Close to free spending limit"
                    : "Healthy free spending"}
              </p>
            </div>

            <p className="mt-3 text-sm opacity-80">
              {formatMoney(usedCents)} used from {formatMoney(limitCents)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm opacity-80">Remaining</p>
            <p className="mt-1 text-2xl font-semibold">
              {formatMoney(remainingCents)}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm opacity-80">
            <span>Used</span>
            <span>{percentUsed}%</span>
          </div>

          <ProgressBar value={percentUsed} tone={tone} />
        </div>
      </div>
    </ChartCard>
  );
}