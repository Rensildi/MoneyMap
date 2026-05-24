import type { Account } from "../types/account";
import type { MonthlyBudget } from "../types/budget";
import type { Category } from "../types/category";
import type { Transaction } from "../types/transaction";
import type { Bill } from "../types/bill";
import type { Goal } from "../types/goal";

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

export const mockMonthlyBudgets: MonthlyBudget[] = [
  {
    id: "budget-restaurants",
    categoryId: "expense-restaurants",
    month: "2026-05",
    budgetedCents: 20000,
  },
  {
    id: "budget-coffee",
    categoryId: "expense-coffee",
    month: "2026-05",
    budgetedCents: 7500,
  },
  {
    id: "budget-shopping",
    categoryId: "expense-shopping",
    month: "2026-05",
    budgetedCents: 15000,
  },
  {
    id: "budget-groceries",
    categoryId: "expense-groceries",
    month: "2026-05",
    budgetedCents: 40000,
  },
  {
    id: "budget-gas",
    categoryId: "expense-gas",
    month: "2026-05",
    budgetedCents: 18000,
  },
  {
    id: "budget-rent",
    categoryId: "expense-rent",
    month: "2026-05",
    budgetedCents: 120000,
  },
  {
    id: "budget-utilities",
    categoryId: "expense-utilities",
    month: "2026-05",
    budgetedCents: 20000,
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

export const mockRecurringBills: Bill[] = [
  {
    id: "bill-rent",
    name: "Rent",
    amountCents: 120000,
    categoryId: "expense-rent",
    accountId: "1",
    dueDay: 1,
    frequency: "monthly",
    isActive: true,
    createdAt: "2026-05-01T10:00:00Z",
  },
  {
    id: "bill-phone",
    name: "Phone Bill",
    amountCents: 8000,
    categoryId: "expense-utilities",
    accountId: "1",
    dueDay: 10,
    frequency: "monthly",
    isActive: true,
    createdAt: "2026-05-01T10:00:00Z",
  },
  {
    id: "bill-insurance",
    name: "Car Insurance",
    amountCents: 17000,
    categoryId: "expense-utilities",
    accountId: "1",
    dueDay: 15,
    frequency: "monthly",
    isActive: true,
    createdAt: "2026-05-01T10:00:00Z",
  },
  {
    id: "bill-netflix",
    name: "Netflix",
    amountCents: 1699,
    categoryId: "expense-utilities",
    accountId: "1",
    dueDay: 20,
    frequency: "monthly",
    isActive: true,
    createdAt: "2026-05-01T10:00:00Z",
  },
  {
    id: "bill-gym",
    name: "Gym Membership",
    amountCents: 3000,
    categoryId: "expense-utilities",
    accountId: "1",
    dueDay: 25,
    frequency: "monthly",
    isActive: true,
    createdAt: "2026-05-01T10:00:00Z",
  },
];

export const mockGoals: Goal[] = [
  {
    id: "goal-emergency",
    name: "Emergency Fund",
    type: "emergency_fund",
    targetCents: 500000,
    currentCents: 125000,
    targetDate: "2026-12-31",
    createdAt: "2026-05-01T10:00:00Z",
  },
  {
    id: "goal-vacation",
    name: "Summer Vacation",
    type: "vacation",
    targetCents: 200000,
    currentCents: 60000,
    targetDate: "2026-08-15",
    createdAt: "2026-05-01T10:00:00Z",
  },
  {
    id: "goal-credit-card",
    name: "Pay Off Credit Card",
    type: "debt_payoff",
    targetCents: 350000,
    currentCents: 90000,
    targetDate: "2026-11-01",
    createdAt: "2026-05-01T10:00:00Z",
  },
];