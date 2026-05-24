export type GoalType =
  | "emergency_fund"
  | "vacation"
  | "car"
  | "house"
  | "debt_payoff"
  | "custom";

export type Goal = {
  id: string;
  name: string;
  type: GoalType;
  targetCents: number;
  currentCents: number;
  targetDate?: string;
  createdAt: string;
};