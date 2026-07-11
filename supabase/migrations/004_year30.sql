-- ═══════════════════════════════════════════════════════════════════
--  YEAR 30 — The Enid Hub Daily Command Center
--  Supabase migration. Run once in the SQL Editor of the SAME project
--  that powers glowup.html (oebxxurgxvzjnunjaujh).
--
--  Single-user personal app. Auth is the publishable anon key + RLS.
--  Every table carries user_id text default 'ENID' to match the
--  existing glowup_* pattern, so a future second profile is a one-line
--  change instead of a schema rewrite.
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. y30_days ── one row per calendar date ────────────────────────
create table if not exists public.y30_days (
  user_id      text        not null default 'ENID',
  date         date        not null,
  day_score    int         check (day_score between 0 and 100),
  mood         int         check (mood between 1 and 5),
  journal_note text,
  created_at   timestamptz not null default now(),
  primary key (user_id, date)
);

-- ── 2. y30_habits ── habit definitions ──────────────────────────────
create table if not exists public.y30_habits (
  id              uuid        primary key default gen_random_uuid(),
  user_id         text        not null default 'ENID',
  name            text        not null,
  icon            text        not null default '✅',
  category        text        not null default 'health'
                    check (category in ('health','wealth','growth','social')),
  target_per_week int         not null default 7 check (target_per_week between 1 and 7),
  active          boolean     not null default true,
  sort_order      int         not null default 0,
  created_at      timestamptz not null default now()
);

-- ── 3. y30_habit_logs ── one row per habit per day ──────────────────
create table if not exists public.y30_habit_logs (
  id         uuid        primary key default gen_random_uuid(),
  user_id    text        not null default 'ENID',
  habit_id   uuid        not null references public.y30_habits(id) on delete cascade,
  date       date        not null,
  completed  boolean     not null default true,
  created_at timestamptz not null default now(),
  unique (habit_id, date)            -- lets us upsert on toggle
);
create index if not exists y30_habit_logs_date_idx on public.y30_habit_logs(date);

-- ── 4. y30_goals ── the Year 30 big rocks ───────────────────────────
create table if not exists public.y30_goals (
  id           uuid        primary key default gen_random_uuid(),
  user_id      text        not null default 'ENID',
  title        text        not null,
  category     text        not null default 'growth'
                 check (category in ('health','wealth','growth','social')),
  target_date  date,
  why          text,
  status       text        not null default 'active'
                 check (status in ('active','done','paused')),
  progress_pct int         not null default 0 check (progress_pct between 0 and 100),
  sort_order   int         not null default 0,
  created_at   timestamptz not null default now()
);

-- ── 5. y30_finance_snapshot ── weekly money check-in ────────────────
create table if not exists public.y30_finance_snapshot (
  id                  uuid        primary key default gen_random_uuid(),
  user_id             text        not null default 'ENID',
  week_of             date        not null,
  checking_balance    numeric(12,2),
  total_debt          numeric(12,2),
  debt_paid_this_week numeric(12,2) default 0,
  notes               text,
  created_at          timestamptz not null default now(),
  unique (user_id, week_of)          -- one snapshot per week, upsertable
);

-- ── 6. y30_calendar_items ── dated to-dos / events ──────────────────
create table if not exists public.y30_calendar_items (
  id         uuid        primary key default gen_random_uuid(),
  user_id    text        not null default 'ENID',
  date       date        not null,
  time       time,                        -- nullable = all-day
  title      text        not null,
  category   text        not null default 'general',
  done       boolean     not null default false,
  created_at timestamptz not null default now()
);
create index if not exists y30_calendar_items_date_idx on public.y30_calendar_items(date);

-- ═══════════════════════════════════════════════════════════════════
--  RLS — single-user personal app, publishable key used client-side.
--  Enable RLS on every table, then grant full access to anon + auth.
--  (Same trust model as the rest of the hub: not multi-tenant.)
-- ═══════════════════════════════════════════════════════════════════
do $$
declare t text;
begin
  foreach t in array array[
    'y30_days','y30_habits','y30_habit_logs',
    'y30_goals','y30_finance_snapshot','y30_calendar_items'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists %I on public.%I;', t||'_all', t);
    execute format(
      'create policy %I on public.%I for all to anon, authenticated using (true) with check (true);',
      t||'_all', t
    );
  end loop;
end $$;

-- ═══════════════════════════════════════════════════════════════════
--  SEED — starter habit set (Phase 1). Safe to re-run: guarded by name.
-- ═══════════════════════════════════════════════════════════════════
insert into public.y30_habits (name, icon, category, target_per_week, sort_order)
select v.name, v.icon, v.category, v.tpw, v.ord
from (values
  ('Gym',                    '🏋️', 'health', 4, 1),
  ('No cash-advance apps',   '🚫', 'wealth', 7, 2),
  ('One outreach / social',  '💬', 'social', 5, 3),
  ('Ship one work task',     '🚀', 'growth', 5, 4),
  ('10 min reading',         '📖', 'growth', 7, 5),
  ('Sleep by target time',   '😴', 'health', 7, 6)
) as v(name, icon, category, tpw, ord)
where not exists (
  select 1 from public.y30_habits h where h.name = v.name and h.user_id = 'ENID'
);
