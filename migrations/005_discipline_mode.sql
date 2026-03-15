-- ============================================================
-- Migration 005: Discipline Mode tables
-- Run in Supabase SQL Editor (project: enid-hub)
-- RLS intentionally omitted — single-user personal app
-- ============================================================

-- ── routine_states ───────────────────────────────────────────────────────────
-- One row per routine per day. Tracks the full lifecycle state.
CREATE TABLE IF NOT EXISTS routine_states (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         text        NOT NULL,
  routine_id      text        NOT NULL,   -- 'morning' | 'work_am' | 'work_pm' | 'evening_reset' | 'go_home' | 'wind_down'
  state_date      date        NOT NULL,
  state           text        NOT NULL DEFAULT 'scheduled',
    -- scheduled | triggered | escalating | started | in_progress | done | skipped | failed | overridden
  stage           integer     NOT NULL DEFAULT 0,  -- escalation stage 0–4
  started_at      timestamptz,
  done_at         timestamptz,
  points          integer     NOT NULL DEFAULT 0,
  lunch_return    text,                   -- stored time string 'HH:MM' for lunch routine
  override_reason text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, routine_id, state_date)
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_routine_state_ts()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS routine_states_updated_at ON routine_states;
CREATE TRIGGER routine_states_updated_at
  BEFORE UPDATE ON routine_states
  FOR EACH ROW EXECUTE FUNCTION update_routine_state_ts();

-- ── discipline_points ────────────────────────────────────────────────────────
-- Append-only log of every point award. Useful for analytics later.
CREATE TABLE IF NOT EXISTS discipline_points (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     text        NOT NULL,
  routine_id  text        NOT NULL,
  action      text        NOT NULL,  -- 'start' | 'done' | 'override'
  points      integer     NOT NULL,
  awarded_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS routine_states_user_date
  ON routine_states (user_id, state_date);

CREATE INDEX IF NOT EXISTS discipline_points_user_date
  ON discipline_points (user_id, awarded_at);

-- ============================================================
-- Notes:
-- * All rows use user_id = 'ENID' (single-user app, no auth)
-- * routine_id values match DISCIPLINE_ROUTINES keys in index.html
-- * state machine transitions: scheduled → triggered → escalating
--   → started → in_progress → done
--   OR any state → skipped | failed | overridden
-- * lunch_return only populated on the 'lunch' routine row
-- ============================================================
