-- PopProfit Database Schema
-- Run this in your Supabase SQL Editor

-- Profiles (linked to auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  biz_name text,
  created_at timestamptz default now()
);

-- Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  emoji text default '🏷',
  price numeric not null,
  cost numeric not null default 0,
  created_at timestamptz default now()
);

-- Inventory
create table if not exists inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  product_id uuid references products on delete cascade not null,
  qty integer not null default 0,
  cost_per_unit numeric not null default 0,
  supplier text,
  created_at timestamptz default now()
);

-- Sales
create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  product_id uuid references products on delete set null,
  product_name text not null,
  qty integer not null,
  price_per_unit numeric not null,
  cost_per_unit numeric not null,
  revenue numeric not null,
  profit numeric not null,
  created_at timestamptz default now()
);

-- Partners
create table if not exists partners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  emoji text default '😊',
  color text default '#3B82F6',
  investment numeric not null default 0,
  notes text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;
alter table products enable row level security;
alter table inventory enable row level security;
alter table sales enable row level security;
alter table partners enable row level security;

-- RLS Policies: profiles
create policy "Users manage own profile" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);

-- RLS Policies: products
create policy "Users manage own products" on products for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- RLS Policies: inventory
create policy "Users manage own inventory" on inventory for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- RLS Policies: sales
create policy "Users manage own sales" on sales for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- RLS Policies: partners
create policy "Users manage own partners" on partners for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create profile on sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, biz_name)
  values (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'biz_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
