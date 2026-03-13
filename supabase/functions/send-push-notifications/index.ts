// ── Enid Hub 🐺 — Send Push Notifications Edge Function ──────────────────────
// Uses npm:web-push for VAPID signing + AES-128-GCM encryption.
// Secrets required: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY
// Auto-provided:    SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// POST body: { "type": "morning" | "afterwork" | "evening" | "weekend" }
//       or:  { "title": "...", "body": "..." }

import webpush from "npm:web-push@3.6.7";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── CORS ──────────────────────────────────────────────────────────────────────
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });

// ── Message banks ─────────────────────────────────────────────────────────────
interface NotifPayload { title: string; body: string; tag?: string; url?: string; }

const MORNING: NotifPayload[] = [
  { title: "Rise & shine sparklepup!! ☀️🐺", body: "8AM means GO time. Your morning routine is waiting!! 💜", tag: "morning" },
  { title: "Good MORNING glowbug!! 🌅", body: "The version of you with her life together wakes up and does the thing. Be her today!! 🐾✨", tag: "morning" },
  { title: "HEY. Wake up. It's 8AM. 🐺☀️", body: "Make your bed first — two minutes, first win of the day!! 🛏️💜", tag: "morning" },
  { title: "Morning kickoff time!! 🌅🔥", body: "Every morning you complete this list is a vote for the life you're building. DO IT NOW!! 💪💜", tag: "morning" },
  { title: "WAKE UP BESTIE 🐺✨", body: "The morning routine won't do itself!! You've done it before and felt amazing. Do it again!! 💜☀️", tag: "morning" },
];
const AFTERWORK: NotifPayload[] = [
  { title: "Work mode OFF!! 💼🐺", body: "First thing: change out of those work clothes RIGHT NOW. It's YOUR time now!! 👟💜", tag: "afterwork" },
  { title: "Hey sparklepup — you survived the day!! 🎉", body: "Now it's after-work routine time. Clothes off, yoga or walk — just pick ONE!! 🧘🚶💜", tag: "afterwork" },
  { title: "5:30PM — after-work check-in!! 💼✨", body: "Work is DONE. Decompress the right way. Change, move your body, you got this!! 🐺🔥", tag: "afterwork" },
  { title: "Clocking out and INTO your routine 🐾💼", body: "After-work habits are your transition from work-you to home-you. Change first!! 👗💜", tag: "afterwork" },
];
const EVENING: NotifPayload[] = [
  { title: "10:30PM — evening routine time!! 🌙🐺", body: "Start heading home if you're out!! Lights out at 11:45. 💜🌙", tag: "evening" },
  { title: "Hey!! It's 10:30PM glowbug 🌙✨", body: "Wash your face. Brush your teeth. TV off by 11:20. You always feel better when you do it!! 🐺💜", tag: "evening" },
  { title: "🌙 Evening routine warning sparklepup!!", body: "Home by 11, face washed, teeth brushed, lights out at 11:45. You've GOT this!! 🐾", tag: "evening" },
  { title: "Night routine o'clock!! 🌙🐺💜", body: "Your sleep matters SO much. Start heading home now. Future you will be SO grateful!! ✨", tag: "evening" },
  { title: "10:30 and your future self is watching 👀🌙", body: "She needs you to do the evening routine RIGHT NOW. Wash face. TV off 11:20. Lights out 11:45!! 🐺💜", tag: "evening" },
];
const WEEKEND: NotifPayload[] = [
  { title: "Weekend essentials check-in!! 📋🐺", body: "Financial review, calendar reset, laundry, Walk Semper!! Don't let Sunday panic hit — do it NOW!! 💜", tag: "weekend" },
  { title: "Hey sparklepup — weekend tasks!! 📋🌸", body: "Semper needs his walk. Your wallet needs a review. Your calendar needs a reset. Open the app!! 🐕💜", tag: "weekend" },
  { title: "🐕 Semper says it's weekend routine time!!", body: "Walk Semper AND do your financial review, calendar reset, and laundry!! GO!! 💰🐺", tag: "weekend" },
  { title: "Weekend essentials are calling!! 🌸📋", body: "30 minutes of effort, whole week of peace. Finance review. Calendar reset. Laundry. Walk Semper!! 🐺💜✨", tag: "weekend" },
];

const BANKS: Record<string, NotifPayload[]> = {
  morning: MORNING, afterwork: AFTERWORK, evening: EVENING, weekend: WEEKEND,
};

function pickMessage(bank: NotifPayload[]): NotifPayload {
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  return bank[seed % bank.length];
}

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  const VAPID_PUBLIC_KEY  = Deno.env.get("VAPID_PUBLIC_KEY")!;
  const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
  const SUPABASE_URL      = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SVCKEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return json({ error: "VAPID keys not configured" }, 500);
  }

  // Configure web-push with VAPID keys
  webpush.setVapidDetails(
    "mailto:enid@enid-hub.local",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
  );

  // Parse body
  let body: Record<string, string> = {};
  try { body = await req.json(); } catch { /* ok */ }

  let notif: NotifPayload;
  if (body.title && body.body) {
    notif = { title: body.title, body: body.body, tag: body.tag, url: body.url };
  } else if (body.type && BANKS[body.type]) {
    notif = pickMessage(BANKS[body.type]);
  } else {
    return json({ error: 'Need { type } or { title, body }' }, 400);
  }
  notif.url ??= "/enid-hub/";

  // Load subscriptions
  const supabase = createClient(SUPABASE_URL, SUPABASE_SVCKEY);
  const { data: subs, error: subErr } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", "ENID");

  if (subErr)                     return json({ error: subErr.message }, 500);
  if (!subs || subs.length === 0) return json({ ok: true, sent: 0, message: "No subscriptions found" });

  // Send to all subscriptions
  const payload = JSON.stringify(notif);
  const expiredEndpoints: string[] = [];

  const results = await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
          { TTL: 86400 },
        );
        return { endpoint: sub.endpoint, ok: true };
      } catch (e: unknown) {
        const err = e as { statusCode?: number; message?: string };
        if (err.statusCode === 410 || err.statusCode === 404) {
          expiredEndpoints.push(sub.endpoint);
        }
        return { endpoint: sub.endpoint, ok: false, error: err.message, status: err.statusCode };
      }
    }),
  );

  if (expiredEndpoints.length > 0) {
    await supabase.from("push_subscriptions").delete().in("endpoint", expiredEndpoints);
  }

  const sent    = results.filter((r) => r.status === "fulfilled" && (r.value as { ok: boolean }).ok).length;
  const failed  = results.length - sent;
  const expired = expiredEndpoints.length;

  console.log(`🐺 Push sent: ${sent} ok, ${failed} failed, ${expired} expired/cleaned`);
  return json({ ok: true, sent, failed, expired, total: subs.length, notif });
});
