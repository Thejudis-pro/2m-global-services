-- Click/view tracking for the digital business card at /madior.
-- Write-only for the public: anonymous visitors can INSERT events, nobody can
-- read them through the API (no SELECT policy). Read them from the Supabase
-- dashboard / SQL editor with the service role.
create table if not exists public.card_events (
  id uuid primary key default gen_random_uuid(),
  card_slug text not null check (char_length(card_slug) <= 50),
  event text not null check (event in ('view', 'click', 'save_contact', 'share', 'qr_open')),
  target text check (target is null or char_length(target) <= 100),
  referrer text check (referrer is null or char_length(referrer) <= 500),
  user_agent text check (user_agent is null or char_length(user_agent) <= 500),
  created_at timestamptz not null default now()
);

create index if not exists card_events_slug_created_idx
  on public.card_events (card_slug, created_at desc);

alter table public.card_events enable row level security;

revoke all on public.card_events from anon, authenticated;
grant insert on public.card_events to anon, authenticated;

drop policy if exists "Anyone can log card events" on public.card_events;
create policy "Anyone can log card events"
  on public.card_events
  for insert
  to anon, authenticated
  with check (true);
