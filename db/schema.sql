-- BMK CRM persistence schema.
-- Run once against the Postgres database (Neon / Supabase / Vercel
-- Postgres) referenced by DATABASE_URL.
--
-- Payloads are AES-256-GCM ciphertext produced by the application
-- (lib/db/crypto.ts). The database never stores client PII in plaintext,
-- so enable provider-level encryption at rest as a second layer, not the
-- only one.

create table if not exists fact_finds (
  client_id   text primary key,
  payload     text not null,          -- enc1.<iv>.<tag>.<ciphertext>
  received_at text not null,
  updated_at  timestamptz not null default now()
);

create table if not exists security_events (
  id    bigint generated always as identity primary key,
  event text not null,
  at    timestamptz not null,
  meta  jsonb not null default '{}'::jsonb
);

create index if not exists security_events_at_idx on security_events (at desc);
create index if not exists security_events_event_idx on security_events (event);
