# HANDOFF — 120-Day Glow-Up Protocol build

_Written 2026-07-01 by Claude Code, for the next session. Source spec:
`C:\Users\simon\Downloads\120-day-glow-up-protocol.md`._

## What was built

The 120-Day Glow-Up Protocol (beginner strength + yoga + conditioning program)
as a new Enid Hub page, styled to match gym.html's design system.

| File | Status | What it is |
|---|---|---|
| `glowup.html` | new, untracked | The whole tracker (~1,880 lines, self-contained like every hub page) |
| `migrations/007_glowup.sql` | new, untracked | Tables: `glowup_settings`, `glowup_workouts`, `glowup_benchmarks`, `glowup_daily_metrics` |
| `index.html` | modified (1 line) | Nav link `✨ Glow-Up` added at line 988 |
| `.gitignore` | new, untracked | Ignores `.mcp.json` only |
| `.mcp.json` | new, gitignored | Supabase MCP server for project ref `oebxxurgxvzjnunjaujh` |

Page features: setup card (Day 1 date + Home/Gym track), progress bar with
checkpoint markers and deload/final-test banners, today's-session card derived
from the weekly template (incl. alternating Fridays in Phases 1–2), daily
metrics with phase-aware step targets and protein/sleep streak chips, 5-checkpoint
benchmarks with delta comparison table, all 4 phases of the program with per-set
loggers (seconds inputs for holds), yoga pose checklists with forward-fold reach,
history + detail modal. All writes use `user_id = 'ENID'` per hub convention.

## What's verified

- Served locally (`npx serve`), loaded `glowup.html`: zero console errors.
- Interactions tested in-browser: phase tabs, day-card expand/collapse,
  exercise checks, set loggers render (18 inputs in P1 Strength A, 2 hold
  inputs), benchmark checkpoint chips swap the 16-field grid, protein ≥120
  turns the metric cell green, all 5 Phase-4 day cards present.
- Graceful degradation confirmed: with no Supabase tables yet, the page shows
  the setup card and empty history instead of breaking.
- `index.html` diff confirmed to be exactly the one nav line.

## What's LEFT (in order)

1. **Run the migration** — `migrations/007_glowup.sql` has NOT been run.
   Paste into the Supabase SQL editor (project `oebxxurgxvzjnunjaujh`), or use
   the Supabase MCP server (available when a session starts in this folder,
   via `.mcp.json`). Until then, every save on the page toasts
   "Failed to save."
2. **End-to-end test** — after migration: save setup (start date + track),
   log a strength session, save daily metrics, save a Day 0 benchmark, and
   reload to confirm persistence + upsert behavior (metrics and benchmarks
   use `on_conflict` upserts; re-saving the same day must update, not error).
3. **Commit & push to deploy** — GitHub Pages serves from pushed `main`
   (thesizmon.github.io/enid-hub). Nothing is committed yet.

## Repo state warnings

- **Pre-existing uncommitted changes, NOT part of this work:** all 8
  `academy/courses/us-history-course/lessons/unit-*.json` files have large
  local modifications (lesson content expansion) that predate this session.
  Don't mix them into a glow-up commit; don't discard them either.
- Two **stale clones** of this repo exist — `C:\Users\simon\enid-hub` and
  `C:\Users\simon\Downloads\enid-hub-local`. This folder
  (`C:\Users\simon\Downloads\enid-hub`) is the live one.
- Supabase URL/key constants are embedded in glowup.html (same values as
  gym.html — hub convention, intentional).
