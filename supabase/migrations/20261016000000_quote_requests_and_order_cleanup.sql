-- 1. Quote requests ("Demandes de devis") shown in /admin/devis.
--    The public can only INSERT a request (contact form, or a click on the
--    product page's WhatsApp quote link). Reading, changing the status and
--    deleting are reserved to admins (public.is_admin()).
create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text check (name is null or char_length(name) <= 200),
  phone text check (phone is null or char_length(phone) <= 50),
  email text check (email is null or char_length(email) <= 255),
  products text check (products is null or char_length(products) <= 1000),
  message text check (message is null or char_length(message) <= 5000),
  source text not null default 'formulaire' check (source in ('formulaire', 'whatsapp')),
  status text not null default 'nouveau' check (status in ('nouveau', 'traite'))
);

create index if not exists quote_requests_created_idx
  on public.quote_requests (created_at desc);

alter table public.quote_requests enable row level security;

revoke all on public.quote_requests from anon, authenticated;
grant insert on public.quote_requests to anon;
grant select, insert, update, delete on public.quote_requests to authenticated;
grant all on public.quote_requests to service_role;

drop policy if exists "Anyone can request a quote" on public.quote_requests;
create policy "Anyone can request a quote"
  on public.quote_requests for insert
  to anon, authenticated
  with check (status = 'nouveau');

drop policy if exists "Admins can view quote requests" on public.quote_requests;
create policy "Admins can view quote requests"
  on public.quote_requests for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update quote requests" on public.quote_requests;
create policy "Admins can update quote requests"
  on public.quote_requests for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete quote requests" on public.quote_requests;
create policy "Admins can delete quote requests"
  on public.quote_requests for delete
  to authenticated
  using (public.is_admin());

-- 2. The checkout no longer asks for a payment method or a delivery slot.
--    Nothing is dropped, so existing orders keep their data: payment_method
--    just stops being mandatory (delivery_slot was already nullable), and the
--    app ignores both columns. The orders RLS policies don't reference either
--    column and are unchanged.
alter table public.orders alter column payment_method drop not null;

-- 3. Product stock is no longer managed. products.stock_quantity stays as is
--    (NOT NULL DEFAULT 0): the app neither reads nor writes it any more, new
--    products simply get the default.
