import { supabase } from "../lib/supabaseClient";
import type { MonthlyBudget } from "../types/budget";

type MonthlyBudgetRow = {
  id: string;
  user_id: string;
  category_id: string;
  month: string;
  budgeted_cents: number;
  created_at: string;
};

type FreeSpendingLimitRow = {
  id: string;
  user_id: string;
  month: string;
  limit_cents: number;
  created_at: string;
};

function mapMonthlyBudgetRow(row: MonthlyBudgetRow): MonthlyBudget {
  return {
    id: row.id,
    categoryId: row.category_id,
    month: row.month,
    budgetedCents: row.budgeted_cents,
  };
}

export async function fetchMonthlyBudgets(
  userId: string,
  month: string,
): Promise<MonthlyBudget[]> {
  const { data, error } = await supabase
    .from("monthly_budgets")
    .select("id, user_id, category_id, month, budgeted_cents, created_at")
    .eq("user_id", userId)
    .eq("month", month)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) =>
    mapMonthlyBudgetRow(row as MonthlyBudgetRow),
  );
}

export async function upsertMonthlyBudget(
  userId: string,
  categoryId: string,
  month: string,
  budgetedCents: number,
): Promise<MonthlyBudget> {
  const { data, error } = await supabase
    .from("monthly_budgets")
    .upsert(
      {
        user_id: userId,
        category_id: categoryId,
        month,
        budgeted_cents: budgetedCents,
      },
      {
        onConflict: "user_id,category_id,month",
      },
    )
    .select("id, user_id, category_id, month, budgeted_cents, created_at")
    .single();

  if (error) {
    throw error;
  }

  return mapMonthlyBudgetRow(data as MonthlyBudgetRow);
}

export async function fetchFreeSpendingLimit(
  userId: string,
  month: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("free_spending_limits")
    .select("id, user_id, month, limit_cents, created_at")
    .eq("user_id", userId)
    .eq("month", month)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return 40000;
  }

  return (data as FreeSpendingLimitRow).limit_cents;
}

export async function upsertFreeSpendingLimit(
  userId: string,
  month: string,
  limitCents: number,
): Promise<number> {
  const { data, error } = await supabase
    .from("free_spending_limits")
    .upsert(
      {
        user_id: userId,
        month,
        limit_cents: limitCents,
      },
      {
        onConflict: "user_id,month",
      },
    )
    .select("id, user_id, month, limit_cents, created_at")
    .single();

  if (error) {
    throw error;
  }

  return (data as FreeSpendingLimitRow).limit_cents;
}