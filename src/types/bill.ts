export type BillFrequency = "monthly" | "weekly" | "yearly";

export type Bill = {
  id: string;
  name: string;
  amountCents: number;
  categoryId?: string;
  accountId?: string;
  dueDay: number;
  frequency: BillFrequency;
  isActive: boolean;
  createdAt: string;
};