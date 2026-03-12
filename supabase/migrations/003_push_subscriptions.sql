-- ── Push Subscriptions table ────────────────────────────────────────────────
-- Stores Web Push subscription endpoints per device/browser.
-- One row per device. Unique on endpoint (each browser/device gets its own).

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     text        NOT NULL,
  endpoint    text        NOT NULL UNIQUE,   -- FCM/VAPID push endpoint URL
  p256dh      text        NOT NULL,          -- browser public key (base64url)
  auth        text        NOT NULL,          -- auth secret (base64url)
  user_agent  text,                          -- for debugging (truncated to 255)
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at on upsert
CREATE OR REPLACE FUNCTION update_push_subscription_ts()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS push_subscriptions_updated_at ON push_subscriptions;
CREATE TRIGGER push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_push_subscription_ts();

-- RLS: allow the anon/publishable key to insert/upsert (single-user app)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_for_enid" ON push_subscriptions;
CREATE POLICY "allow_all_for_enid" ON push_subscriptions
  FOR ALL USING (true) WITH CHECK (true);
