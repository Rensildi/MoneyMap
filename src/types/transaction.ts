export type TransactionType = "income" | "expense" | "transfer";

export type Transaction = {
  id: string;
  type: TransactionType;
  amountCents: number;
  accountId: string;
  transferAccountId?: string;
  categoryId?: string;
  merchant?: string;
  notes?: string;
  transactionDate: string;
  createdAt: string;
};