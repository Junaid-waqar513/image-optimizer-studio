-- Run once in Supabase → SQL Editor. Safe to re-run.

create table if not exists public.users (
  id                     uuid primary key references auth.users(id) on delete cascade,
  email                  text,
  subscription_status    text,          -- active | trialing | past_due | paused | canceled | null
  subscription_tier      text,          -- Starter | Pro | Advanced | null
  paddle_subscription_id text,
  paddle_customer_id     text,
  scan_allowance         integer not null default 0,
  scans_used             integer not null default 0,
  current_period_end     timestamptz,
  created_at             timestamptz not null default now()
);

create table if not exists public.transactions (
  paddle_transaction_id text primary key,
  user_id               uuid references public.users(id) on delete set null,
  amount                text,
  currency              text,
  status                text,
  created_at            timestamptz not null default now()
);

-- Auto-create a users row whenever someone signs up.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email) values (new.id, new.email) on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill anyone who already signed up.
insert into public.users (id, email)
  select id, email from auth.users on conflict (id) do nothing;

-- RLS: users may READ their own row; only the webhook (service role) may write.
alter table public.users enable row level security;
alter table public.transactions enable row level security;

drop policy if exists "read own user row" on public.users;
create policy "read own user row" on public.users for select using (auth.uid() = id);

drop policy if exists "read own transactions" on public.transactions;
create policy "read own transactions" on public.transactions for select using (auth.uid() = user_id);
