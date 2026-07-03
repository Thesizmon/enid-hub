-- ============================================================
-- Migration 007: 120-Day Glow-Up Protocol tables
-- Run in Supabase SQL Editor (project: enid-hub)
-- RLS intentionally omitted — single-user personal app
-- ============================================================

-- ── glowup_settings ──────────────────────────────────────────────────────────
-- One row per user. Holds program start date and equipment track.
CREATE TABLE IF NOT EXISTS glowup_settings (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     text        NOT NULL UNIQUE,
  start_date  date        NOT NULL,
  track       text        NOT NULL DEFAULT 'home',  -- 'home' | 'gym'
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ── glowup_workouts ──────────────────────────────────────────────────────────
-- One row per completed session. Exercise set data stored as JSONB
-- (same pattern as gym_sessions).
CREATE TABLE IF NOT EXISTS glowup_workouts (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       text        NOT NULL,
  session_date  date        NOT NULL,
  program_day   integer,                -- 1–120, derived from start_date
  phase         integer     NOT NULL,   -- 1–4
  session_type  text        NOT NULL,
    -- strength_a | strength_b | strength_c | upper_a | lower_a | upper_b
    -- | yoga | conditioning | rest
  session_label text,
  track         text,                   -- 'home' | 'gym'
  completed     boolean     NOT NULL DEFAULT true,
  duration_min  integer,
  exercises     jsonb,                  -- [{name, sets:[{weight, reps, duration_sec, completed}]}]
  yoga          jsonb,                  -- {flow_name, poses_completed:[], forward_fold_reach_in}
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ── glowup_benchmarks ────────────────────────────────────────────────────────
-- One row per checkpoint (Day 0 / 30 / 60 / 90 / 120).
CREATE TABLE IF NOT EXISTS glowup_benchmarks (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         text        NOT NULL,
  checkpoint_day  integer     NOT NULL,  -- 0 | 30 | 60 | 90 | 120
  test_date       date,
  bodyweight_lbs  numeric,
  pushup_max      integer,
  squat_2min_max  integer,
  plank_sec       integer,
  dead_hang_sec   integer,
  mile_time_sec   integer,
  resting_hr      integer,
  sit_reach_in    numeric,               -- negative = short of toes
  deep_squat_sec  integer,
  measurements    jsonb,                 -- {chest, waist, hips, arm_l, arm_r, thigh_l, thigh_r}
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, checkpoint_day)
);

-- ── glowup_daily_metrics ─────────────────────────────────────────────────────
-- One row per calendar day. Concurrent Protocols A (protein) + B (sleep).
CREATE TABLE IF NOT EXISTS glowup_daily_metrics (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             text        NOT NULL,
  metric_date         date        NOT NULL,
  steps               integer,
  protein_g           integer,
  sleep_hrs           numeric,
  weight_lbs          numeric,
  wake_time           text,              -- 'HH:MM'
  caffeine_cutoff_ok  boolean,
  wind_down_done      boolean,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, metric_date)
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS glowup_workouts_user_date
  ON glowup_workouts (user_id, session_date);

CREATE INDEX IF NOT EXISTS glowup_daily_metrics_user_date
  ON glowup_daily_metrics (user_id, metric_date);

-- ============================================================
-- Notes:
-- * All rows use user_id = 'ENID' (single-user app, no auth)
-- * program_day = (session_date - start_date) + 1; Day 0 = baseline day
-- * Phase mapping: days 1-30 = 1, 31-60 = 2, 61-90 = 3, 91-120 = 4
-- * Protein target 130g/day, sleep floor 7 hrs — targets live in
--   glowup.html, only raw numbers stored here
-- ============================================================
