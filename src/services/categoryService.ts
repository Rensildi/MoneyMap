import { supabase } from "../lib/supabaseClient";
import type { Category, CategoryType } from "../types/category";

type CategoryRow = {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  counts_toward_free_spending: boolean;
  created_at: string;
};

const defaultCategories: {
  name: string;
  type: CategoryType;
  countsTowardFreeSpending: boolean;
}[] = [
  {
    name: "Paycheck",
    type: "income",
    countsTowardFreeSpending: false,
  },
  {
    name: "Side Work",
    type: "income",
    countsTowardFreeSpending: false,
  },
  {
    name: "Restaurants",
    type: "expense",
    countsTowardFreeSpending: true,
  },
  {
    name: "Coffee",
    type: "expense",
    countsTowardFreeSpending: true,
  },
  {
    name: "Shopping",
    type: "expense",
    countsTowardFreeSpending: true,
  },
  {
    name: "Groceries",
    type: "expense",
    countsTowardFreeSpending: false,
  },
  {
    name: "Gas",
    type: "expense",
    countsTowardFreeSpending: false,
  },
  {
    name: "Rent",
    type: "expense",
    countsTowardFreeSpending: false,
  },
  {
    name: "Utilities",
    type: "expense",
    countsTowardFreeSpending: false,
  },
];

function mapCategoryRow(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    countsTowardFreeSpending: row.counts_toward_free_spending,
  };
}

export async function fetchCategories(userId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select(
      "id, user_id, name, type, counts_toward_free_spending, created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapCategoryRow(row as CategoryRow));
}

export async function seedDefaultCategoriesIfNeeded(
  userId: string,
): Promise<Category[]> {
  const existingCategories = await fetchCategories(userId);

  if (existingCategories.length > 0) {
    return existingCategories;
  }

  const rowsToInsert = defaultCategories.map((category) => ({
    user_id: userId,
    name: category.name,
    type: category.type,
    counts_toward_free_spending: category.countsTowardFreeSpending,
  }));

  const { data, error } = await supabase
    .from("categories")
    .insert(rowsToInsert)
    .select(
      "id, user_id, name, type, counts_toward_free_spending, created_at",
    )
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapCategoryRow(row as CategoryRow));
}