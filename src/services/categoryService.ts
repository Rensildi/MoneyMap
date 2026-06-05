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
    name: "Home Utilities",
    type: "expense",
    countsTowardFreeSpending: false,
  },
  {
    name: "Phone",
    type: "expense",
    countsTowardFreeSpending: false,
  },
  {
    name: "Internet",
    type: "expense",
    countsTowardFreeSpending: false,
  },
  {
    name: "Streaming",
    type: "expense",
    countsTowardFreeSpending: true,
  },
  {
    name: "Subscriptions",
    type: "expense",
    countsTowardFreeSpending: true,
  },
  {
    name: "Insurance",
    type: "expense",
    countsTowardFreeSpending: false,
  },
  {
    name: "Property Taxes",
    type: "expense",
    countsTowardFreeSpending: false,
  },
  {
    name: "Car Payment",
    type: "expense",
    countsTowardFreeSpending: false,
  },
  {
    name: "Gym",
    type: "expense",
    countsTowardFreeSpending: true,
  },
];

const categoryOrder = [
  "Paycheck",
  "Side Work",
  "Restaurants",
  "Coffee",
  "Shopping",
  "Groceries",
  "Gas",
  "Rent",
  "Home Utilities",
  "Phone",
  "Internet",
  "Streaming",
  "Subscriptions",
  "Insurance",
  "Property Taxes",
  "Car Payment",
  "Gym",
];

function sortCategories(categories: Category[]) {
  return [...categories].sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a.name);
    const bIndex = categoryOrder.indexOf(b.name);

    if (aIndex === -1 && bIndex === -1) {
      return a.name.localeCompare(b.name);
    }

    if (aIndex === -1) {
      return 1;
    }

    if (bIndex === -1) {
      return -1;
    }

    return aIndex - bIndex;
  });
}

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

  return sortCategories(
    (data ?? []).map((row) => mapCategoryRow(row as CategoryRow)),
  );
}

export async function seedDefaultCategoriesIfNeeded(
  userId: string,
): Promise<Category[]> {
  const existingCategories = await fetchCategories(userId);

  const missingCategories = defaultCategories.filter((defaultCategory) => {
    return !existingCategories.some(
      (existingCategory) =>
        existingCategory.name.toLowerCase() ===
          defaultCategory.name.toLowerCase() &&
        existingCategory.type === defaultCategory.type,
    );
  });

  if (missingCategories.length === 0) {
    return existingCategories;
  }

  const rowsToInsert = missingCategories.map((category) => ({
    user_id: userId,
    name: category.name,
    type: category.type,
    counts_toward_free_spending: category.countsTowardFreeSpending,
  }));

  const { error } = await supabase.from("categories").insert(rowsToInsert);

  if (error) {
    throw error;
  }

  return fetchCategories(userId);
}

export async function updateCategoryFreeSpendingStatus(
  userId: string,
  categoryId: string,
  countsTowardFreeSpending: boolean,
): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .update({
      counts_toward_free_spending: countsTowardFreeSpending,
    })
    .eq("id", categoryId)
    .eq("user_id", userId)
    .select(
      "id, user_id, name, type, counts_toward_free_spending, created_at",
    )
    .single();

  if (error) {
    throw error;
  }

  return mapCategoryRow(data as CategoryRow);
}