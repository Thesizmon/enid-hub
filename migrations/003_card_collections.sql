-- ============================================================
-- Migration 003: Card collections persistence for cards.html
-- Run in Supabase SQL Editor (project: enid-hub)
-- Stores Enid's Wednesday trading card collection state.
-- ============================================================
-- cards.html uses two set keys (one per card release):
--   'set1' — original Wednesday card set (already released)
--   'set2' — late-March drop (upcoming)
-- Each row holds the full serialized collection state as JSONB.
-- Upserts by (user_id, set_key) via:
--   Prefer: resolution=merge-duplicates (on_conflict=user_id,set_key)
-- ============================================================

CREATE TABLE IF NOT EXISTS card_collections (
  user_id    TEXT        NOT NULL,
  set_key    TEXT        NOT NULL,
  data       JSONB,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, set_key)
);

-- Optional: index for faster lookups by user
CREATE INDEX IF NOT EXISTS idx_card_collections_user ON card_collections (user_id);

-- ============================================================
-- Notes:
-- * RLS intentionally omitted — single-user personal app
-- * No seed data needed — app creates rows on first save
-- * updated_at is set by the app on each write (ISO string)
-- ============================================================
