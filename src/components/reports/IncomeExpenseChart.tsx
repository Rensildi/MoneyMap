import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "./ChartCard";
import { useMoney } from "../../hooks/useMoney";

type IncomeExpenseChartProps = {
  incomeCents: number;
  expensesCents: number;
};

export function IncomeExpenseChart({
  incomeCents,
  expensesCents,
}: IncomeExpenseChartProps) {
  const { money } = useMoney();
  const data = [
    {
      name: "Income",
      amount: incomeCents / 100,
    },
    {
      name: "Expenses",
      amount: expensesCents / 100,
    },
  ];

  return (
    <ChartCard
      title="Income vs expenses"
      description="Simple monthly cash flow comparison"
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