-- Two extra order statuses so a cancelled or returned order can be recorded
-- (and left out of the dashboard revenue) instead of staying "Nouvelle" or
-- being deleted. ALTER TYPE ... ADD VALUE is idempotent with IF NOT EXISTS.
alter type public.order_status add value if not exists 'annulée';
alter type public.order_status add value if not exists 'retour';
