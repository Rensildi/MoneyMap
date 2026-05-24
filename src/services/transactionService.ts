import { supabase } from "../lib/supabaseClient";
import type {
  Transaction,
  TransactionType,
} from "../types/transaction";

type TransactionRow = {
  id: string;
  user_id: string;
  type: TransactionType;
  amount_cents: number;
  account_id: string;
  transfer_account_id?: string | null;
  category_id?: string | null;
  merchant?: string | null;
  notes?: string | null;
  transaction_date: string;
  created_at: string;
};

export type CreateTransactionInput = {
  type: TransactionType;
  amountCents: number;
  accountId: string;
  transferAccountId?: string;
  categoryId?: string;
  merchant?: string;
  notes?: string;
  transactionDate: string;
};

function mapTransactionRow(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type,
    amountCents: row.amount_cents,
    accountId: row.account_id,
    transferAccountId: row.transfer_account_id ?? undefined,
    categoryId: row.category_id ?? undefined,
    merchant: row.merchant ?? undefined,
    notes: row.notes ?? undefined,
    transactionDate: row.transaction_date,
    createdAt: row.created_at,
  };
}

export async function fetchTransactions(
  userId: string,
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select(
      "id, user_id, type, amount_cents, account_id, transfer_account_id, category_id, merchant, notes, transaction_date, created_at",
    )
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) =>
    mapTransactionRow(row as TransactionRow),
  );
}

export async function createTransaction(
  input: CreateTransactionInput,
): Promise<Transaction> {
  const { data, error } = await supabase
    .rpc("create_transaction_with_balance", {
      p_type: input.type,
      p_amount_cents: input.amountCents,
      p_account_id: input.accountId,
      p_transaction_date: input.transactionDate,
      p_transfer_account_id: input.transferAccountId ?? null,
      p_category_id: input.categoryId ?? null,
      p_merchant: input.merchant ?? null,
      p_notes: input.notes ?? null,
    })
    .single();

  if (error) {
    throw error;
  }

  return mapTransactionRow(data as TransactionRow);
}