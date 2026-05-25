import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Bill } from "../../types/bill";
import { ChartCard } from "./ChartCard";
import { useMoney } from "../../hooks/useMoney";

type BillsBreakdownChartProps = {
  bills: Bill[];
};

export function BillsBreakdownChart({ bills }: BillsBreakdownChartProps) {
  const { money } = useMoney();
  const data = bills
    .filter((bill) => bill.isActive)
    .map((bill) => ({
      name: bill.name,
      amount: bill.amountCents / 100,
    }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <ChartCard
      title="Bills breakdown"
      description="Recurring payments ranked by amount"
    >
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip
              formatter={(value) => [money(Number(value) * 100), "Amount"]}
            />
            <Bar dataKey="amount" radius={[12, 12, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}