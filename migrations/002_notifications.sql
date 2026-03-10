-- ============================================================
-- Migration 002: Notification schedule table
-- Run in Supabase SQL Editor (project: enid-hub)
-- All rows scoped to user_id = 'ENID' (single-user app)
-- NOTE: The app also auto-seeds these rows via seedNotificationsIfEmpty()
--       on first load if the table is empty — running this SQL is optional.
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  hour        INTEGER NOT NULL,          -- 0-23
  minute      INTEGER NOT NULL,          -- 0-59
  days        INTEGER[] NOT NULL,        -- JS getDay() values: 0=Sun...6=Sat
  notif_type  TEXT NOT NULL,             -- 'fixed' | 'conditional' | 'monthly'
  group_label TEXT NOT NULL,             -- 'Morning' | 'Afternoon' | 'Evening' | 'Weekend' | 'Monthly'
  label       TEXT NOT NULL,             -- short display label in the settings editor
  title       TEXT NOT NULL,             -- notification title (user-editable)
  body        TEXT NOT NULL,             -- notification body (user-editable)
  UNIQUE (user_id, id)
);

INSERT INTO notifications
  (id, user_id, enabled, hour, minute, days, notif_type, group_label, label, title, body)
VALUES

-- ── MORNING (Mon-Fri) ────────────────────────────────────────────────────────

('wake-hydrate-bed', 'ENID', TRUE, 8, 0, ARRAY[1,2,3,4,5], 'fixed', 'Morning',
 'Wake / Hydrate / Make Bed',
 'Rise & shine sparklepup!! ☀️🐺',
 '8AM means GO time. No phone for 10 minutes — make your bed FIRST, chug some water, get moving. The day starts NOW!! 💜🛏️'),

('stretch-mindfulness', 'ENID', TRUE, 8, 5, ARRAY[1,2,3,4,5], 'fixed', 'Morning',
 'Stretch / Mindfulness',
 '5 minutes and you''re better already!! 🧘🐺',
 'Quick stretch or one minute of deep breathing right NOW. Do it before your brain wakes up enough to argue. You will feel SO good. 💜✨'),

('motivation-plan', 'ENID', TRUE, 8, 25, ARRAY[1,2,3,4,5], 'fixed', 'Morning',
 'Motivation / Plan Check',
 'Check your plan, spark your motivation!! 🌟🐺',
 'What are you doing today and WHY does it matter? Spend 60 seconds reading your calendar and deciding who you''re going to be today. Then GO!! 💜📋'),

('conditional-habits-noon', 'ENID', TRUE, 11, 0, ARRAY[1,2,3,4,5], 'conditional', 'Morning',
 'Midday Habit Nudge (if no habits done)',
 'Hey... where are your morning habits?? 🐾👀',
 'It''s 11AM and the tracker is looking a little empty, roomie!! No judgment — just a nudge. Even ONE habit right now beats zero. Open the app!! 💜🌸'),

-- ── AFTERNOON (Mon-Fri) ──────────────────────────────────────────────────────

('movement-momentum', 'ENID', TRUE, 17, 45, ARRAY[1,2,3,4,5], 'fixed', 'Afternoon',
 'Movement / Momentum',
 'Work mode OFF, movement mode ON!! 🏃🐺',
 'It''s 5:45 and your body needs to MOVE. Yoga or a walk — you only need one!! Change your clothes first, signal your brain it''s YOUR time now. 💜🧘'),

('side-projects', 'ENID', TRUE, 18, 15, ARRAY[1,2,3,4,5], 'fixed', 'Afternoon',
 'Side Projects Reminder',
 'Side project hour starts NOW roomie!! 💻🐺',
 'One focused hour on the thing you''re building. Not scrolling. Not "in a minute." Right now. Future you is literally counting on current you!! 🔥💜'),

-- ── EVENING (Daily) ──────────────────────────────────────────────────────────

('skincare-reset', 'ENID', TRUE, 23, 0, ARRAY[0,1,2,3,4,5,6], 'fixed', 'Evening',
 'Skincare / Reset Space',
 'Skincare time + reset your space!! 🌙🐺',
 '11PM — wash your face, do your skincare, and spend 5 minutes resetting your space. You deserve to wake up to a calm environment tomorrow. 💜🫧'),

('prep-tomorrow', 'ENID', TRUE, 23, 20, ARRAY[0,1,2,3,4,5,6], 'fixed', 'Evening',
 'Prep Tomorrow',
 'Two minutes to set yourself up for tomorrow!! ✨🐺',
 'Lay out your outfit, check your calendar, write down your top 3 for tomorrow. THAT''S IT. Two minutes and future-you will be SO grateful!! 💜📋'),

('bedtime', 'ENID', TRUE, 23, 45, ARRAY[0,1,2,3,4,5,6], 'fixed', 'Evening',
 'Bedtime Reminder',
 'Lights out sparklepup!! 🌙💜',
 'It''s 11:45PM. TV OFF. Phone DOWN. You did the thing today. Close your eyes. Tomorrow is a whole new vote for the life you''re building!! 🐺🌸'),

-- ── WEEKEND (Sat + Sun) ───────────────────────────────────────────────────────

('weekend-prep', 'ENID', TRUE, 11, 0, ARRAY[0,6], 'fixed', 'Weekend',
 'Weekly Prep / Finance Review',
 'Weekend essentials TIME glowbug!! 📋🐺',
 'Finance review + calendar reset + check in with your goals. 30 minutes of effort = a whole week of not panicking. You''ve SO got this!! 💜💰'),

('weekend-prep-backup', 'ENID', TRUE, 20, 0, ARRAY[0,6], 'fixed', 'Weekend',
 'Backup Weekly Prep (8PM)',
 'Last call for weekend essentials roomie!! ⚠️🐺',
 'If you haven''t done the finance review and calendar reset yet — RIGHT NOW is your last chance before the week hits. 20 minutes. Do it!! 💜📋'),

('laundry-sunday', 'ENID', TRUE, 11, 30, ARRAY[0], 'fixed', 'Weekend',
 'Laundry (Sunday)',
 'LAUNDRY DAY!! Throw that load in NOW!! 🧺🐺',
 'Sunday is laundry day and you KNOW it!! Toss the load in right now while you''re thinking about it. Don''t be Monday-you with no clean clothes!! 💜🌸'),

('room-reset-weekend', 'ENID', TRUE, 13, 0, ARRAY[0,6], 'fixed', 'Weekend',
 'Room Reset',
 'Room reset time — 20 minutes, sparklepup!! 🏠🐺',
 'A clean space = a calm brain!! Quick room reset: surfaces clear, floor clear, bed made, take out trash if needed. Your space is your sanctuary!! 💜✨'),

-- ── MONTHLY ──────────────────────────────────────────────────────────────────

('monthly-audit', 'ENID', TRUE, 18, 0, ARRAY[0,1,2,3,4,5,6], 'monthly', 'Monthly',
 'Monthly Financial Audit',
 'Monthly audit day, bestie!! 💰🐺',
 'It''s the last day of the month — time for the big financial audit. Check every balance, review every category, plan for next month. You''ve got full visibility!! 💜📊')

ON CONFLICT (user_id, id) DO UPDATE SET
  enabled     = EXCLUDED.enabled,
  hour        = EXCLUDED.hour,
  minute      = EXCLUDED.minute,
  days        = EXCLUDED.days,
  notif_type  = EXCLUDED.notif_type,
  group_label = EXCLUDED.group_label,
  label       = EXCLUDED.label,
  title       = EXCLUDED.title,
  body        = EXCLUDED.body;

-- ============================================================
-- Notes:
-- * RLS intentionally omitted — single-user personal app
-- * monthly-audit days = all days; the monthly check in JS
--   ignores the days array and uses a "last day of month" date check
-- * KT shift notifications are handled separately in the app via
--   the kt_shifts table (date-specific, not weekly recurring)
-- ============================================================
