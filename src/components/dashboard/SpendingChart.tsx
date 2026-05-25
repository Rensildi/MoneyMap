import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "../ui/Card";
import { useMoney } from "../../hooks/useMoney";

type SpendingChartDataItem = {
  name: string;
  amountCents: number;
};

type SpendingChartProps = {
  data: SpendingChartDataItem[];
};

export function SpendingChart({ data }: SpendingChartProps) {
  const { money } = useMoney();
  const chartData = data.map((item) => ({
    name: item.name,
    amount: item.amountCents / 100,
  }));

  return (
    <Card>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Spending Overview
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            By category
          </h2>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          This month
        </span>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-72 items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50">
          <p className="text-sm font-medium text-slate-400">
            No expense data yet.
          </p>
        </div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip
                formatter={(value) => [money(Number(value) * 100), "Spent"]}
              />
              <Bar dataKey="amount" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}