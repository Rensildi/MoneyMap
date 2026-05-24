import type { Account } from "../types/account";
import type { Category } from "../types/category";
import type { Transaction } from "../types/transaction";

export const mockAccounts: Account[] = [
  {
    id: "1",
    name: "Main Checking",
    type: "checking",
    balanceCents: 428042,
  },
  {
    id: "2",
    name: "Savings Vault",
    type: "savings",
    balanceCents: 185050,
  },
  {
    id: "3",
    name: "Cash Wallet",
    type: "cash",
    balanceCents: 12000,
  },
];

export const mockCategories: Category[] = [
  {
    id: "income-paycheck",
    name: "Paycheck",
    type: "income",
    countsTowardFreeSpending: false,
  },
  {
    id: "income-side-work",
    name: "Side Work",
    type: "income",
    countsTowardFreeSpending: false,
  },
  {
    id: "expense-restaurants",
    name: "Restaurants",
    type: "expense",
    countsTowardFreeSpending: true,
  },
  {
    id: "expense-coffee",
    name: "Coffee",
    type: "expense",
    countsTowardFreeSpending: true,
  },
  {
    id: "expense-shopping",
    name: "Shopping",
    type: "expense",
    countsTowardFreeSpending: true,
  },
  {
    id: "expense-groceries",
    name: "Groceries",
    type: "expense",
    countsTowardFreeSpending: false,
  },
  {
    id: "expense-gas",
    name: "Gas",
    type: "expense",
    countsTowardFreeSpending: false,
  },
  {
    id: "expense-rent",
    name: "Rent",
    type: "expense",
    countsTowardFreeSpending: false,
  },
  {
    id: "expense-utilities",
    name: "Utilities",
    type: "expense",
    countsTowardFreeSpending: false,
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "income",
    amountCents: 250000,
    accountId: "1",
    categoryId: "income-paycheck",
    merchant: "Paycheck",
    transactionDate: "2026-05-22",
    createdAt: "2026-05-22T10:00:00Z",
  },
  {
    id: "2",
    type: "expense",
    amountCents: 1450,
    accountId: "1",
    categoryId: "expense-restaurants",
    merchant: "Chipotle",
    transactionDate: "2026-05-23",
    createdAt: "2026-05-23T12:00:00Z",
  },
  {
    id: "3",
    type: "expense",
    amountCents: 4800,
    accountId: "1",
    categoryId: "expense-gas",
    merchant: "Shell",
    transactionDate: "2026-05-23",
    createdAt: "2026-05-23T16:30:00Z",
  },
  {
    id: "4",
    type: "transfer",
    amountCents: 50000,
    accountId: "1",
    transferAccountId: "2",
    merchant: "Transfer to Savings",
    transactionDate: "2026-05-24",
    createdAt: "2026-05-24T09:00:00Z",
  },
];

export const mockFreeSpending = {
  limitCents: 40000,
  usedCents: 28200,
};

export const mockMonthlySummary = {
  incomeCents: 380000,
  expensesCents: 214500,
};

export const mockBills = [
  {
    id: "1",
    name: "Rent",
    dueDate: "June 1",
    amountCents: 120000,
  },
  {
    id: "2",
    name: "Phone Bill",
    dueDate: "June 10",
    amountCents: 8000,
  },
  {
    id: "3",
    name: "Car Insurance",
    dueDate: "June 15",
    amountCents: 17000,
  },
];

export const mockSpendingByCategory = [
  {
    name: "Food",
    amount: 420,
  },
  {
    name: "Gas",
    amount: 190,
  },
  {
    name: "Shopping",
    amount: 260,
  },
  {
    name: "Bills",
    amount: 820,
  },
  {
    name: "Fun",
    amount: 135,
  },
];