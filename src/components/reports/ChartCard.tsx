import type { ReactNode } from "react";
import { Card } from "../ui/Card";

type ChartCardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <Card>
      <div className="mb-6">
        <p className="text-sm font-medium text-slate-500">{description}</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
          {title}
        </h2>
      </div>

      {children}
    </Card>
  );
}