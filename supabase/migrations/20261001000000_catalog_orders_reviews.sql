-- Catalog, orders, and reviews schema for 2M Global Services.
--
-- Admin access is granted via a custom JWT claim: set `app_metadata.role = "admin"`
-- on a Supabase Auth user (via the dashboard's "Edit user" raw JSON editor, or
-- `supabase.auth.admin.updateUserById(id, { app_metadata: { role: "admin" } })`
-- from a trusted server context). app_metadata cannot be edited by the user
-- themselves, so it is safe to trust in RLS policies.
--
-- There is no customer-account system: checkout is guest-only. Orders are
-- publicly insertable but never publicly readable — the checkout confirmation
-- page renders from a client-side stash of the just-created order, not a
-- database read-back (see src/lib/orders.ts).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helpers
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
-- categories / subcategories (flat, slug-keyed — matches the app's model of
-- one level of subcategories, reordered by swapping sort_order)
-- ---------------------------------------------------------------------------
create table public.categories (
  slug text primary key,
  label text not null,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

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

create table public.subcategories (
  category_slug text not null references public.categories(slug) on delete cascade,
  slug text not null,
  label text not null,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (category_slug, slug)
);

create unique index idx_subcategories_composite on public.subcategories(category_slug, slug);

create trigger set_subcategories_updated_at
  before update on public.subcategories
  for each row execute function public.set_updated_at();

alter table public.subcategories enable row level security;

create policy "Subcategories are publicly readable"
  on public.subcategories for select
  using (true);

create policy "Only admins can insert subcategories"
  on public.subcategories for insert
  with check (public.is_admin());

create policy "Only admins can update subcategories"
  on public.subcategories for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Only admins can delete subcategories"
  on public.subcategories for delete
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table public.products (
  id text primary key,
  name text not null,
  alt text not null,
  image text not null,
  images jsonb not null default '[]',
  category_slug text not null references public.categories(slug) on delete restrict,
  subcategory_slug text,
  original_price numeric(12, 2) not null check (original_price >= 0),
  discount_percent integer not null default 0 check (discount_percent between 0 and 100),
  rating numeric(3, 2) not null default 0,
  popularity integer not null default 0,
  is_new boolean not null default false,
  created_at date not null default current_date,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  featured boolean not null default false,
  sku text unique,
  weight_kg numeric(10, 2),
  dimensions jsonb,
  description text,
  updated_at timestamptz not null default now(),
  foreign key (category_slug, subcategory_slug)
    references public.subcategories(category_slug, slug)
    on delete set null
);

create index idx_products_category_slug on public.products(category_slug);
create index idx_products_subcategory on public.products(category_slug, subcategory_slug);

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
-- orders (guest checkout — no customer accounts)
-- ---------------------------------------------------------------------------
create type public.order_status as enum ('nouvelle', 'en_traitement', 'expédiée', 'terminée');
create type public.delivery_method as enum ('pickup', 'delivery');
create type public.payment_method as enum ('cod', 'wave', 'bank-transfer');

create table public.orders (
  order_number text primary key,
  created_at timestamptz not null default now(),
  status public.order_status not null default 'nouvelle',
  items jsonb not null,
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  discount_total numeric(12, 2) not null default 0 check (discount_total >= 0),
  delivery_fee numeric(12, 2) not null default 0 check (delivery_fee >= 0),
  total numeric(12, 2) not null check (total >= 0),
  customer_name text not null,
  phone text not null,
  email text not null,
  address text not null,
  city text not null,
  region text not null,
  delivery_method public.delivery_method not null,
  delivery_slot text,
  payment_method public.payment_method not null
);

alter table public.orders enable row level security;

-- Guests can place an order but can never read any order back — the
-- confirmation page renders from a client-side stash, not a DB read.
create policy "Anyone can place an order"
  on public.orders for insert
  with check (true);

create policy "Admins can view all orders"
  on public.orders for select
  using (public.is_admin());

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
  product_id text not null references public.products(id) on delete cascade,
  name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  date date not null default current_date,
  approved boolean not null default false
);

create index idx_reviews_product_id on public.reviews(product_id);

alter table public.reviews enable row level security;

create policy "Approved reviews are publicly readable"
  on public.reviews for select
  using (approved = true or public.is_admin());

-- Anyone (including guests) can submit a review, but it always starts
-- unapproved.
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

-- ---------------------------------------------------------------------------
-- Storage: product images
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Product images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Only admins can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Only admins can update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Only admins can delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

-- ---------------------------------------------------------------------------
-- Seed data: categories, subcategories, reviews
-- (products are seeded separately via an admin-triggered one-time import,
-- since each product's photo has to be fetched and re-uploaded to Storage —
-- not something a static SQL migration can do.)
-- ---------------------------------------------------------------------------
insert into public.categories (slug, label, sort_order) values
  ('meubles-de-bureau', 'Meubles de Bureau', 0),
  ('fauteuils-chaises', 'Fauteuils / Chaises', 1),
  ('salon-chambre', 'Salon et Chambre à coucher', 2),
  ('armoires', 'Armoires Métalliques & Bois', 3),
  ('electroniques', 'Électroniques', 4),
  ('coffre-fort', 'Coffre Fort', 5),
  ('parfumerie', 'Parfumerie', 6);

insert into public.subcategories (category_slug, slug, label, sort_order) values
  ('meubles-de-bureau', 'bureau-direction', 'Bureau Direction', 0),
  ('meubles-de-bureau', 'bureau-secretaire-agent', 'Bureau Secrétaire/Agent', 1),
  ('meubles-de-bureau', 'meubles-de-rangement', 'Meubles de Rangement', 2),
  ('meubles-de-bureau', 'table-de-reunion', 'Table de Réunion', 3),
  ('fauteuils-chaises', 'chaises-de-direction', 'Chaises de Direction', 0),
  ('fauteuils-chaises', 'fauteuils-de-direction', 'Fauteuils de Direction', 1),
  ('fauteuils-chaises', 'fauteuils-chaise-visiteur', 'Fauteuils/Chaise Visiteur', 2),
  ('salon-chambre', 'salon', 'Salon', 0),
  ('salon-chambre', 'chambre-a-coucher', 'Chambre à Coucher', 1),
  ('salon-chambre', 'table-basse', 'Table Basse', 2);

-- Reviews reference products by id, but products are only inserted by the
-- one-time import that runs after this migration — defer this seed until
-- that import has run (it's safe to insert later; see
-- src/lib/admin-import.server.ts, which inserts these same 8 rows itself
-- right after it finishes importing products).
