-- BMK CRM encrypted persistence schema.
-- Run once against your Postgres database (Neon, Supabase, Vercel Postgres):
--   psql "$DATABASE_URL" -f db/schema.sql
--
-- All ciphertext columns hold AES-256-GCM envelopes produced by the
-- application (lib/secure-store/crypto.ts). The database never sees
-- plaintext client data.

CREATE TABLE IF NOT EXISTS secure_records (
  namespace   text        NOT NULL,
  key         text        NOT NULL,
  ciphertext  text        NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (namespace, key)
);

CREATE TABLE IF NOT EXISTS secure_events (
  id          bigserial   PRIMARY KEY,
  namespace   text        NOT NULL,
  ciphertext  text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS secure_events_namespace_idx
  ON secure_events (namespace, id DESC);
