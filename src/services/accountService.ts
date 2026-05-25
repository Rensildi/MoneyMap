import { supabase } from "../lib/supabaseClient";
import type { Account, AccountType } from "../types/account";

type AccountRow = {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  balance_cents: number;
  created_at: string;
};

function mapAccountRow(row: AccountRow): Account {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    balanceCents: row.balance_cents,
  };
}

export async function fetchAccounts(userId: string): Promise<Account[]> {
  const { data, error } = await supabase
    .from("accounts")
    .select("id, user_id, name, type, balance_cents, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapAccountRow(row as AccountRow));
}

export async function createAccount(
  userId: string,
  account: {
    name: string;
    type: AccountType;
    balanceCents: number;
  },
): Promise<Account> {
  const { data, error } = await supabase
    .from("accounts")
    .insert({
      user_id: userId,
      name: account.name,
      type: account.type,
      balance_cents: account.balanceCents,
    })
    .select("id, user_id, name, type, balance_cents, created_at")
    .single();

  if (error) {
    throw error;
  }

  return mapAccountRow(data as AccountRow);
}

export async function updateAccount(
  userId: string,
  accountId: string,
  account: {
    name: string;
    type: AccountType;
    balanceCents: number;
  },
): Promise<Account> {
  const { data, error } = await supabase
    .from("accounts")
    .update({
      name: account.name,
      type: account.type,
      balance_cents: account.balanceCents,
    })
    .eq("id", accountId)
    .eq("user_id", userId)
    .select("id, user_id, name, type, balance_cents, created_at")
    .single();

  if (error) {
    throw error;
  }

  return mapAccountRow(data as AccountRow);
}

export async function deleteAccount(
  userId: string,
  accountId: string,
): Promise<void> {
  const { data: dependentTransactions, error: transactionError } =
    await supabase
      .from("transactions")
      .select("id")
      .eq("user_id", userId)
      .or(`account_id.eq.${accountId},transfer_account_id.eq.${accountId}`)
      .limit(1);

  if (transactionError) {
    throw transactionError;
  }

  if ((dependentTransactions ?? []).length > 0) {
    throw new Error(
      "This account has transactions. Delete or move those transactions before deleting the account.",
    );
  }

  const { data: dependentBills, error: billError } = await supabase
    .from("bills")
    .select("id")
    .eq("user_id", userId)
    .eq("account_id", accountId)
    .limit(1);

  if (billError) {
    throw billError;
  }

  if ((dependentBills ?? []).length > 0) {
    throw new Error(
      "This account is used by bills. Remove or edit those bills before deleting the account.",
    );
  }

  const { error } = await supabase
    .from("accounts")
    .delete()
    .eq("id", accountId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}