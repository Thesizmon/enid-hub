-- ============================================================
-- Migration 006: Dingers Dashboard persistence
-- Run in Supabase SQL Editor (project: enid-hub)
-- Stores Enid's MLB Dinger Dashboard state: tracked hitters,
-- excluded players, saved parlays, and parlay templates.
-- ============================================================
-- dingers.html uses four keys:
--   'hitters'   — tracked hitter watchlist
--   'excluded'  — excluded player pool
--   'parlays'   — saved parlays
--   'templates' — parlay templates
-- Each row holds the full serialized array as JSONB.
-- Upserts by (user_id, key) via:
--   Prefer: resolution=merge-duplicates (on_conflict=user_id,key)
-- ============================================================

CREATE TABLE IF NOT EXISTS dingers_state (
  user_id    TEXT        NOT NULL,
  key        TEXT        NOT NULL,
  data       JSONB       NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, key)
);

-- Optional: index for faster lookups by user
CREATE INDEX IF NOT EXISTS idx_dingers_state_user ON dingers_state (user_id);

-- ============================================================
-- Notes:
-- * RLS intentionally omitted — single-user personal app
-- * No seed data needed — app creates rows on first save
-- * updated_at is set by the app on each write (ISO string)
-- ============================================================
