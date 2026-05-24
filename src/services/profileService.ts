import { supabase } from "../lib/supabaseClient";
import type {
  AppSettings,
  CurrencyCode,
  ThemePreference,
} from "../types/settings";

type ProfileRow = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  currency: CurrencyCode;
  default_free_spending_limit_cents: number;
  theme: ThemePreference;
  bill_reminders_enabled: boolean;
  budget_warnings_enabled: boolean;
  goal_reminders_enabled: boolean;
  created_at: string;
};

function mapProfileRow(row: ProfileRow): AppSettings {
  return {
    fullName: row.full_name ?? "",
    email: row.email ?? "",
    currency: row.currency,
    defaultFreeSpendingLimitCents: row.default_free_spending_limit_cents,
    theme: row.theme,
    billRemindersEnabled: row.bill_reminders_enabled,
    budgetWarningsEnabled: row.budget_warnings_enabled,
    goalRemindersEnabled: row.goal_reminders_enabled,
  };
}

export async function fetchProfileSettings(
  userId: string,
  fallbackEmail?: string,
): Promise<AppSettings> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, currency, default_free_spending_limit_cents, theme, bill_reminders_enabled, budget_warnings_enabled, goal_reminders_enabled, created_at",
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    const { data: insertedProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email: fallbackEmail ?? "",
        full_name: "",
        currency: "USD",
        default_free_spending_limit_cents: 40000,
        theme: "light",
        bill_reminders_enabled: true,
        budget_warnings_enabled: true,
        goal_reminders_enabled: false,
      })
      .select(
        "id, full_name, email, currency, default_free_spending_limit_cents, theme, bill_reminders_enabled, budget_warnings_enabled, goal_reminders_enabled, created_at",
      )
      .single();

    if (insertError) {
      throw insertError;
    }

    return mapProfileRow(insertedProfile as ProfileRow);
  }

  return mapProfileRow(data as ProfileRow);
}

export async function updateProfileSettings(
  userId: string,
  settings: AppSettings,
): Promise<AppSettings> {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: settings.fullName,
      email: settings.email,
      currency: settings.currency,
      default_free_spending_limit_cents:
        settings.defaultFreeSpendingLimitCents,
      theme: settings.theme,
      bill_reminders_enabled: settings.billRemindersEnabled,
      budget_warnings_enabled: settings.budgetWarningsEnabled,
      goal_reminders_enabled: settings.goalRemindersEnabled,
    })
    .eq("id", userId)
    .select(
      "id, full_name, email, currency, default_free_spending_limit_cents, theme, bill_reminders_enabled, budget_warnings_enabled, goal_reminders_enabled, created_at",
    )
    .single();

  if (error) {
    throw error;
  }

  return mapProfileRow(data as ProfileRow);
}