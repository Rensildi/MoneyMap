import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Goal } from "../../types/goal";
import { ChartCard } from "./ChartCard";

type GoalProgressChartProps = {
  goals: Goal[];
};

export function GoalProgressChart({ goals }: GoalProgressChartProps) {
  const data = goals.map((goal) => ({
    name: goal.name,
    progress:
      goal.targetCents > 0
        ? Math.min(Math.round((goal.currentCents / goal.targetCents) * 100), 100)
        : 0,
  }));

  return (
    <ChartCard
      title="Goal progress"
      description="How close each goal is to completion"
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
            <Tooltip formatter={(value) => [`${value}%`, "Progress"]} />
            <Bar dataKey="progress" radius={[12, 12, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}