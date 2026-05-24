create extension if not exists "pgcrypto";

-- =========================
-- PROFILES
-- =========================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  currency text not null default 'USD',
  default_free_spending_limit_cents integer not null default 40000,
  theme text not null default 'light',
  bill_reminders_enabled boolean not null default true,
  budget_warnings_enabled boolean not null default true,
  goal_reminders_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);


-- =========================
-- ACCOUNTS
-- =========================

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (
    type in ('checking', 'savings', 'cash', 'credit_card', 'loan', 'investment')
  ),
  balance_cents integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.accounts enable row level security;

create policy "Users can manage their own accounts"
on public.accounts
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- =========================
-- CATEGORIES
-- =========================

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  counts_toward_free_spending boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "Users can manage their own categories"
on public.categories
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- =========================
-- TRANSACTIONS
-- =========================

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense', 'transfer')),
  amount_cents integer not null check (amount_cents > 0),
  account_id uuid not null references public.accounts(id) on delete cascade,
  transfer_account_id uuid references public.accounts(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  merchant text,
  notes text,
  transaction_date date not null,
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "Users can view their own transactions"
on public.transactions
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own transactions"
on public.transactions
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.accounts
    where accounts.id = transactions.account_id
    and accounts.user_id = auth.uid()
  )
  and (
    transfer_account_id is null
    or exists (
      select 1 from public.accounts
      where accounts.id = transactions.transfer_account_id
      and accounts.user_id = auth.uid()
    )
  )
  and (
    category_id is null
    or exists (
      select 1 from public.categories
      where categories.id = transactions.category_id
      and categories.user_id = auth.uid()
    )
  )
);

create policy "Users can update their own transactions"
on public.transactions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own transactions"
on public.transactions
for delete
to authenticated
using (auth.uid() = user_id);


-- =========================
-- FREE SPENDING LIMITS
-- =========================

create table if not exists public.free_spending_limits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null,
  limit_cents integer not null default 0,
  created_at timestamptz not null default now(),
  unique(user_id, month)
);

alter table public.free_spending_limits enable row level security;

create policy "Users can manage their own free spending limits"
on public.free_spending_limits
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- =========================
-- MONTHLY BUDGETS
-- =========================

create table if not exists public.monthly_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  month text not null,
  budgeted_cents integer not null default 0,
  created_at timestamptz not null default now(),
  unique(user_id, category_id, month)
);

alter table public.monthly_budgets enable row level security;

create policy "Users can manage their own monthly budgets"
on public.monthly_budgets
for all
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.categories
    where categories.id = monthly_budgets.category_id
    and categories.user_id = auth.uid()
  )
);


-- =========================
-- BILLS
-- =========================

create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount_cents integer not null check (amount_cents > 0),
  category_id uuid references public.categories(id) on delete set null,
  account_id uuid references public.accounts(id) on delete set null,
  due_day integer not null check (due_day >= 1 and due_day <= 31),
  frequency text not null default 'monthly' check (
    frequency in ('weekly', 'monthly', 'yearly')
  ),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.bills enable row level security;

create policy "Users can manage their own bills"
on public.bills
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- =========================
-- BILL PAYMENTS
-- Paid/unpaid status per month
-- =========================

create table if not exists public.bill_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bill_id uuid not null references public.bills(id) on delete cascade,
  month text not null,
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(user_id, bill_id, month)
);

alter table public.bill_payments enable row level security;

create policy "Users can manage their own bill payments"
on public.bill_payments
for all
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.bills
    where bills.id = bill_payments.bill_id
    and bills.user_id = auth.uid()
  )
);


-- =========================
-- GOALS
-- =========================

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (
    type in ('emergency_fund', 'vacation', 'car', 'house', 'debt_payoff', 'custom')
  ),
  target_cents integer not null check (target_cents > 0),
  current_cents integer not null default 0,
  target_date date,
  created_at timestamptz not null default now()
);

alter table public.goals enable row level security;

create policy "Users can manage their own goals"
on public.goals
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- =========================
-- AUTO CREATE PROFILE AFTER SIGNUP
-- =========================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();