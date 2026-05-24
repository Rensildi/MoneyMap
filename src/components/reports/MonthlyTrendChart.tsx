import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "./ChartCard";

type MonthlyTrendItem = {
  month: string;
  incomeCents: number;
  expensesCents: number;
  freeSpendingCents: number;
};

type MonthlyTrendChartProps = {
  data: MonthlyTrendItem[];
};

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const chartData = data.map((item) => ({
    month: item.month,
    income: item.incomeCents / 100,
    expenses: item.expensesCents / 100,
    freeSpending: item.freeSpendingCents / 100,
  }));

  return (
    <ChartCard
      title="Monthly trend"
      description="Income, expenses, and free spending over time"
    >
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="income"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="freeSpending"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}