-- ============================================================
-- Migration 004: movies, books, reading_sessions tables
-- Run in Supabase SQL Editor (project: enid-hub)
-- All rows scoped to user_id = 'ENID' (single-user app)
-- ============================================================

-- ── MOVIES ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS movies (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL,
  tmdb_id      INTEGER,
  title        TEXT NOT NULL,
  poster_path  TEXT,
  release_year INTEGER,
  hype         INTEGER DEFAULT 3,
  watched      BOOLEAN DEFAULT FALSE,
  added_at     BIGINT,
  UNIQUE (user_id, id)
);

-- ── BOOKS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS books (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL,
  ol_key       TEXT,
  title        TEXT NOT NULL,
  author       TEXT,
  cover_id     BIGINT,
  total_pages  INTEGER,
  pages_read   INTEGER DEFAULT 0,
  status       TEXT DEFAULT 'want',   -- 'want' | 'reading' | 'read' | 'abandoned'
  notes        TEXT,
  added_at     TEXT,
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, id)
);

-- Auto-update updated_at on any PATCH/UPDATE
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS books_set_updated_at ON books;
CREATE TRIGGER books_set_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── READING SESSIONS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reading_sessions (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id      TEXT NOT NULL,
  book_id      TEXT REFERENCES books(id) ON DELETE CASCADE,
  session_date TEXT NOT NULL,
  pages_read   INTEGER NOT NULL,
  notes        TEXT
);

-- ============================================================
-- Notes:
-- * RLS intentionally omitted — single-user personal app
-- * movies.added_at is a JS epoch millis (BIGINT), not TIMESTAMPTZ
-- * books.added_at is an ISO string (TEXT) from new Date().toISOString()
-- * updated_at trigger keeps the homepage "currently reading" widget
--   sorted correctly (index.html queries order=updated_at.desc.nullslast)
-- ============================================================
