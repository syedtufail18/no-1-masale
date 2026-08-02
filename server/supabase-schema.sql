-- Run this once in Supabase Dashboard > SQL Editor.
-- The table is private: only the server's service role can read or write it.

create extension if not exists pgcrypto;

create table if not exists public.customer_reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  rating smallint not null check (rating between 1 and 5),
  review text not null check (char_length(review) between 1 and 1200),
  image_path text,
  consent_to_publish boolean not null default false,
  consent_for_updates boolean not null default false,
  publish_consented_at timestamptz,
  consented_at timestamptz,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_reviews_status_created_at_idx
  on public.customer_reviews (status, created_at desc);

alter table public.customer_reviews enable row level security;
revoke all on public.customer_reviews from anon, authenticated;
grant all on public.customer_reviews to service_role;

insert into storage.buckets (id, name, public)
values ('review-images', 'review-images', false)
on conflict (id) do nothing;

-- The bucket remains private. The server creates short-lived signed URLs
-- only for approved public images or for an admin notification preview.
