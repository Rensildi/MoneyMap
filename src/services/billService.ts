import { supabase } from "../lib/supabaseClient";
import type { Bill, BillFrequency } from "../types/bill";

type BillRow = {
  id: string;
  user_id: string;
  name: string;
  amount_cents: number;
  category_id?: string | null;
  account_id?: string | null;
  due_day: number;
  frequency: BillFrequency;
  is_active: boolean;
  created_at: string;
};

type BillPaymentRow = {
  id: string;
  user_id: string;
  bill_id: string;
  month: string;
  paid_at: string;
  created_at: string;
};

function mapBillRow(row: BillRow): Bill {
  return {
    id: row.id,
    name: row.name,
    amountCents: row.amount_cents,
    categoryId: row.category_id ?? undefined,
    accountId: row.account_id ?? undefined,
    dueDay: row.due_day,
    frequency: row.frequency,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export async function fetchBills(userId: string): Promise<Bill[]> {
  const { data, error } = await supabase
    .from("bills")
    .select(
      "id, user_id, name, amount_cents, category_id, account_id, due_day, frequency, is_active, created_at",
    )
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("due_day", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapBillRow(row as BillRow));
}

export async function createBill(
  userId: string,
  bill: {
    name: string;
    amountCents: number;
    categoryId?: string;
    accountId?: string;
    dueDay: number;
    frequency: BillFrequency;
  },
): Promise<Bill> {
  const { data, error } = await supabase
    .from("bills")
    .insert({
      user_id: userId,
      name: bill.name,
      amount_cents: bill.amountCents,
      category_id: bill.categoryId ?? null,
      account_id: bill.accountId ?? null,
      due_day: bill.dueDay,
      frequency: bill.frequency,
      is_active: true,
    })
    .select(
      "id, user_id, name, amount_cents, category_id, account_id, due_day, frequency, is_active, created_at",
    )
    .single();

  if (error) {
    throw error;
  }

  return mapBillRow(data as BillRow);
}

export async function deleteBill(
  userId: string,
  billId: string,
): Promise<void> {
  const { error } = await supabase
    .from("bills")
    .delete()
    .eq("id", billId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export async function fetchPaidBillIdsForMonth(
  userId: string,
  month: string,
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("bill_payments")
    .select("id, user_id, bill_id, month, paid_at, created_at")
    .eq("user_id", userId)
    .eq("month", month);

  if (error) {
    throw error;
  }

  const paidIds = new Set<string>();

  for (const row of data ?? []) {
    paidIds.add((row as BillPaymentRow).bill_id);
  }

  return paidIds;
}

export async function markBillPaid(
  userId: string,
  billId: string,
  month: string,
): Promise<void> {
  const { error } = await supabase.from("bill_payments").upsert(
    {
      user_id: userId,
      bill_id: billId,
      month,
      paid_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,bill_id,month",
    },
  );

  if (error) {
    throw error;
  }
}

export async function markBillUnpaid(
  userId: string,
  billId: string,
  month: string,
): Promise<void> {
  const { error } = await supabase
    .from("bill_payments")
    .delete()
    .eq("user_id", userId)
    .eq("bill_id", billId)
    .eq("month", month);

  if (error) {
    throw error;
  }
}