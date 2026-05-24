import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Category } from "../../types/category";
import type { Transaction } from "../../types/transaction";
import { ChartCard } from "./ChartCard";

type SpendingByCategoryChartProps = {
  transactions: Transaction[];
  categories: Category[];
};

export function SpendingByCategoryChart({
  transactions,
  categories,
}: SpendingByCategoryChartProps) {
  const data = categories
    .filter((category) => category.type === "expense")
    .map((category) => {
      const amount = transactions
        .filter(
          (transaction) =>
            transaction.type === "expense" &&
            transaction.categoryId === category.id,
        )
        .reduce((total, transaction) => total + transaction.amountCents, 0);

      return {
        name: category.name,
        amount: amount / 100,
      };
    })
    .filter((item) => item.amount > 0);

  return (
    <ChartCard
      title="Spending by category"
      description="Where your money went this month"
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
            <Tooltip formatter={(value) => [`$${value}`, "Spent"]} />
            <Bar dataKey="amount" radius={[12, 12, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}