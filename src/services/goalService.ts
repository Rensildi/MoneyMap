import { supabase } from "../lib/supabaseClient";
import type { Goal, GoalType } from "../types/goal";

type GoalRow = {
  id: string;
  user_id: string;
  name: string;
  type: GoalType;
  target_cents: number;
  current_cents: number;
  target_date?: string | null;
  created_at: string;
};

function mapGoalRow(row: GoalRow): Goal {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    targetCents: row.target_cents,
    currentCents: row.current_cents,
    targetDate: row.target_date ?? undefined,
    createdAt: row.created_at,
  };
}

export async function fetchGoals(userId: string): Promise<Goal[]> {
  const { data, error } = await supabase
    .from("goals")
    .select(
      "id, user_id, name, type, target_cents, current_cents, target_date, created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapGoalRow(row as GoalRow));
}

export async function createGoal(
  userId: string,
  goal: {
    name: string;
    type: GoalType;
    targetCents: number;
    currentCents: number;
    targetDate?: string;
  },
): Promise<Goal> {
  const { data, error } = await supabase
    .from("goals")
    .insert({
      user_id: userId,
      name: goal.name,
      type: goal.type,
      target_cents: goal.targetCents,
      current_cents: goal.currentCents,
      target_date: goal.targetDate ?? null,
    })
    .select(
      "id, user_id, name, type, target_cents, current_cents, target_date, created_at",
    )
    .single();

  if (error) {
    throw error;
  }

  return mapGoalRow(data as GoalRow);
}

export async function updateGoalProgress(
  userId: string,
  goalId: string,
  currentCents: number,
): Promise<Goal> {
  const { data, error } = await supabase
    .from("goals")
    .update({
      current_cents: currentCents,
    })
    .eq("id", goalId)
    .eq("user_id", userId)
    .select(
      "id, user_id, name, type, target_cents, current_cents, target_date, created_at",
    )
    .single();

  if (error) {
    throw error;
  }

  return mapGoalRow(data as GoalRow);
}

export async function deleteGoal(
  userId: string,
  goalId: string,
): Promise<void> {
  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", goalId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export async function updateGoal(
  userId: string,
  goalId: string,
  goal: {
    name: string;
    type: GoalType;
    targetCents: number;
    currentCents: number;
    targetDate?: string;
  },
): Promise<Goal> {
  const { data, error } = await supabase
    .from("goals")
    .update({
      name: goal.name,
      type: goal.type,
      target_cents: goal.targetCents,
      current_cents: goal.currentCents,
      target_date: goal.targetDate ?? null,
    })
    .eq("id", goalId)
    .eq("user_id", userId)
    .select(
      "id, user_id, name, type, target_cents, current_cents, target_date, created_at",
    )
    .single();

  if (error) {
    throw error;
  }

  return mapGoalRow(data as GoalRow);
}