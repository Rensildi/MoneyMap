export type AccountType =
  | "checking"
  | "savings"
  | "cash"
  | "credit_card"
  | "loan"
  | "investment";

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  balanceCents: number;
};