-- Initial schema for Techno Office Sarl: catalog, orders, customers, reviews.
--
-- This migration has NOT been applied to any live project — no Supabase project
-- is linked to this repo yet. To apply it:
--   1. supabase link --project-ref <your-project-ref>
--   2. supabase db push
-- or paste this file's contents into the Supabase dashboard's SQL editor.
--
-- Admin access is granted via a custom JWT claim: set `app_metadata.role = "admin"`
-- on a user (e.g. `supabase.auth.admin.updateUserById(id, { app_metadata: { role: "admin" } })`
-- from a trusted server context, or via the dashboard). app_metadata cannot be
-- edited by the user themselves, so it is safe to trust in RLS policies.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helper: is the current request authenticated as an admin?
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- categories (self-referencing: parent_id null = top-level category,
-- parent_id set = subcategory of that category)
-- ---------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references public.categories(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_categories_parent_id on public.categories(parent_id);

alter table public.categories enable row level security;

create policy "Categories are publicly readable"
  on public.categories for select
  using (true);

create policy "Only admins can insert categories"
  on public.categories for insert
  with check (public.is_admin());

create policy "Only admins can update categories"
  on public.categories for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Only admins can delete categories"
  on public.categories for delete
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(12, 2) not null check (price >= 0),
  sale_price numeric(12, 2) check (sale_price is null or sale_price >= 0),
  weight numeric(10, 2),
  dimensions text,
  sku text not null unique,
  category_id uuid not null references public.categories(id) on delete restrict,
  subcategory_id uuid references public.categories(id) on delete set null,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  image_urls text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_products_category_id on public.products(category_id);
create index idx_products_slug on public.products(slug);

create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

alter table public.products enable row level security;

create policy "Products are publicly readable"
  on public.products for select
  using (true);

create policy "Only admins can insert products"
  on public.products for insert
  with check (public.is_admin());

create policy "Only admins can update products"
  on public.products for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Only admins can delete products"
  on public.products for delete
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- customers (id is the Supabase auth user id)
-- ---------------------------------------------------------------------------
create table public.customers (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  addresses jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_customers_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

alter table public.customers enable row level security;

create policy "Customers can view their own profile"
  on public.customers for select
  using (auth.uid() = id);

create policy "Customers can insert their own profile"
  on public.customers for insert
  with check (auth.uid() = id);

create policy "Customers can update their own profile"
  on public.customers for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Extension beyond the literal spec: the admin panel needs to display customer
-- names/contact info alongside orders.
create policy "Admins can view all customers"
  on public.customers for select
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
create type public.order_status as enum ('nouvelle', 'en_traitement', 'expédiée', 'terminée');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  items jsonb not null,
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  discount_total numeric(12, 2) not null default 0 check (discount_total >= 0),
  total numeric(12, 2) not null check (total >= 0),
  payment_method text not null,
  status public.order_status not null default 'nouvelle',
  created_at timestamptz not null default now()
);

create index idx_orders_customer_id on public.orders(customer_id);

alter table public.orders enable row level security;

create policy "Customers can view their own orders"
  on public.orders for select
  using (customer_id = auth.uid());

create policy "Customers can insert their own orders"
  on public.orders for insert
  with check (customer_id = auth.uid());

create policy "Customers can update their own orders"
  on public.orders for update
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());

create policy "Admins can view all orders"
  on public.orders for select
  using (public.is_admin());

-- Extension beyond the literal spec: the admin panel needs to progress orders
-- through their status lifecycle (nouvelle -> en_traitement -> expédiée -> terminée).
create policy "Admins can update all orders"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete orders"
  on public.orders for delete
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- reviews (moderated: only shown publicly once approved)
-- ---------------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_reviews_product_id on public.reviews(product_id);

alter table public.reviews enable row level security;

create policy "Approved reviews are publicly readable"
  on public.reviews for select
  using (approved = true);

create policy "Admins can view all reviews"
  on public.reviews for select
  using (public.is_admin());

-- Anyone (including guests) can submit a review, but it always starts
-- unapproved and is only visible to its author's session until moderated.
create policy "Anyone can submit a review pending moderation"
  on public.reviews for insert
  with check (approved = false);

create policy "Only admins can moderate reviews"
  on public.reviews for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Only admins can delete reviews"
  on public.reviews for delete
  using (public.is_admin());
