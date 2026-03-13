// ── Enid Hub 🐺 — Send Push Notifications Edge Function ──────────────────────
// Sends Web Push (RFC 8291 / RFC 8188 aes128gcm) with VAPID auth to all
// stored push subscriptions.
//
// Deploy:  supabase functions deploy send-push-notifications
// Secrets: VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY (set via supabase secrets set)
//
// POST body: { "type": "morning" | "afterwork" | "evening" | "weekend" }
//       or:  { "title": "...", "body": "..." }
//
// Schedule (pg_cron examples — run in Supabase SQL editor):
//   SELECT cron.schedule('morning-push',  '0 13 * * *',   $$SELECT net.http_post(url:='https://<ref>.supabase.co/functions/v1/send-push-notifications', headers:='{"Authorization":"Bearer <anon_key>","Content-Type":"application/json"}'::jsonb, body:='{"type":"morning"}'::jsonb) AS request_id$$);
//   SELECT cron.schedule('afterwork-push','30 22 * * 1-5', $$SELECT net.http_post(...)$$);  -- 5:30PM CST = 10:30PM UTC weekdays
//   SELECT cron.schedule('evening-push',  '30 3  * * *',  $$SELECT net.http_post(...)$$);   -- 10:30PM CST = 3:30AM UTC
//   SELECT cron.schedule('weekend-push',  '0 14  * * 6,0',$$SELECT net.http_post(...)$$);   -- 9AM CST Sat+Sun

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Types ──────────────────────────────────────────────────────────────────────
interface PushSub {
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface NotifPayload {
  title: string;
  body: string;
  tag?: string;
  url?: string;
}

// ── Message banks (mirrors sw.js) ─────────────────────────────────────────────
const MORNING_MESSAGES: NotifPayload[] = [
  { title: "Rise & shine sparklepup!! ☀️🐺", body: "8AM means it's GO time. Your morning routine is waiting and it's not gonna do itself. You've got this!! 💜", tag: "morning" },
  { title: "Good MORNING glowbug!! 🌅", body: "The version of you with her life together wakes up and does the thing. Be her today. Open the app!! 🐾✨", tag: "morning" },
  { title: "HEY. Wake up. It's 8AM. 🐺☀️", body: "Your morning routine is literally just waiting for you. Make your bed first — two minutes, first win of the day!! 🛏️💜", tag: "morning" },
  { title: "Roomie wake UP!! ☀️🌸", body: "Today has never happened before!! You get to decide what kind of day it becomes. Start with the morning routine. 🌈🐺", tag: "morning" },
  { title: "Morning kickoff time sparklepup!! 🌅🔥", body: "Every morning you complete this list is a vote for the life you're building. Cast that vote RIGHT NOW!! 💪💜", tag: "morning" },
  { title: "☀️ It's 8AM and you KNOW what that means!!", body: "Rise, grind, and absolutely slay your morning routine. Wash your face. Make your bed. EAT SOMETHING. Go go go!! 🐺🌸", tag: "morning" },
  { title: "WAKE UP BESTIE 🐺✨", body: "The morning routine won't complete itself!! You've literally done this before and felt so good after. Do it again today. 💜☀️", tag: "morning" },
];

const AFTERWORK_MESSAGES: NotifPayload[] = [
  { title: "Work mode OFF!! 5:30 hits different 💼🐺", body: "First thing: change out of those work clothes RIGHT NOW. Signal your brain it's YOUR time now. Then open the app!! 👟💜", tag: "afterwork" },
  { title: "Hey sparklepup — you survived the day!! 🎉", body: "Now it's after-work routine time. Clothes off, comfy outfit on, yoga or walk — just pick ONE. You've earned it!! 🧘🚶💜", tag: "afterwork" },
  { title: "5:30PM and the after-work check-in is calling!! 💼✨", body: "Work is DONE. Now decompress the right way. Change, move your body, check SCC messages, one work block. You got this!! 🐺🔥", tag: "afterwork" },
  { title: "Clocking out and INTO your routine 🐾💼", body: "The after-work habits are your transition from work-you to home-you. Change your clothes first. It actually helps, I promise!! 👗💜", tag: "afterwork" },
  { title: "It's 5:30!! After-work routine time roomie!! 🌆🐺", body: "Yoga OR walk — you only need ONE. That's it. Then an hour of work and 15 minutes reading. So doable. Open the app!! 📖✨", tag: "afterwork" },
];

const EVENING_MESSAGES: NotifPayload[] = [
  { title: "10:30PM — evening routine time!! 🌙🐺", body: "That means start heading home if you're out!! The routine starts NOW, not when you get home. Lights out at 11:45. 💜🌙", tag: "evening" },
  { title: "Hey!! It's 10:30PM glowbug 🌙✨", body: "Begin to head home. Wash your face. Brush your teeth. TV off by 11:20. You know the drill and you always feel better when you do it!! 🐺💜", tag: "evening" },
  { title: "🌙 Evening routine warning sparklepup!!", body: "15 minutes until you should be wrapping up wherever you are!! Home by 11, face washed, teeth brushed, lights out at 11:45. You've GOT this!! 🐾", tag: "evening" },
  { title: "Night routine o'clock!! 🌙🐺💜", body: "Your sleep matters SO much. Start heading home now. The routine is short — wash up, TV off, read a little, lights out. Future you will be SO grateful!! ✨", tag: "evening" },
  { title: "10:30 and your future self is watching 👀🌙", body: "She needs you to do the evening routine RIGHT NOW. Head home. Wash face. Brush teeth. TV off at 11:20. Lights out 11:45. DO IT!! 🐺💜", tag: "evening" },
  { title: "🌙 Hey!! Evening routine time!!", body: "I know you wanna stay up but your sleep is part of the life you're building!! Start winding down now. Wash your face. Get cozy. You did today!! 🌸🐺", tag: "evening" },
  { title: "BEDTIME ROUTINE TIME glowbug!! 🌙💜", body: "10:30PM means the clock is ticking!! Head home if you're out. Wash up. TV off by 11:20. Lights out 11:45. You crushed today — now rest!! 🐾✨", tag: "evening" },
];

const WEEKEND_MESSAGES: NotifPayload[] = [
  { title: "Weekend essentials check-in!! 📋🐺", body: "It's the weekend and the big four are waiting: financial review, calendar reset, laundry, and Walk Semper!! Don't let Sunday evening panic hit — do it NOW!! 💜", tag: "weekend" },
  { title: "Hey sparklepup — weekend tasks!! 📋🌸", body: "Semper needs his walk. Your wallet needs a review. Your calendar needs a reset. Your laundry needs to happen. That's it!! Open the app!! 🐕💜", tag: "weekend" },
  { title: "🐕 Semper says it's weekend routine time!!", body: "That good boy needs his walk AND you need to do your financial review, calendar reset, and laundry!! Two birds, one stone — take Semper AND do a money check!! 💰🐺", tag: "weekend" },
  { title: "Weekend essentials are calling roomie!! 📋🐺", body: "Financial review so no bill surprises. Calendar reset so no schedule chaos. Laundry so you have clothes. Walk Semper so he's happy. GO!! 💜🌈", tag: "weekend" },
  { title: "It's the weekend and the list awaits!! 🌸📋", body: "Future-you on Monday NEEDS you to do the weekend essentials today!! 30 minutes of effort, whole week of peace. You know the drill!! 🐺💜✨", tag: "weekend" },
];

const MESSAGE_BANKS: Record<string, NotifPayload[]> = {
  morning: MORNING_MESSAGES,
  afterwork: AFTERWORK_MESSAGES,
  evening: EVENING_MESSAGES,
  weekend: WEEKEND_MESSAGES,
};

function pickMessage(bank: NotifPayload[]): NotifPayload {
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  return bank[seed % bank.length];
}

// ── Base64url helpers ─────────────────────────────────────────────────────────
function b64urlEncode(bytes: Uint8Array): string {
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function b64urlDecode(b64: string): Uint8Array {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob(b64.replace(/-/g, "+").replace(/_/g, "/") + pad);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) { out.set(a, offset); offset += a.length; }
  return out;
}

function textEncode(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

// ── HKDF (single-step extract+expand via Web Crypto) ─────────────────────────
async function hkdf(ikm: Uint8Array, salt: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, key, length * 8);
  return new Uint8Array(bits);
}

// ── Web Push payload encryption — RFC 8291 / RFC 8188 (aes128gcm) ─────────────
// Returns the full encrypted body (salt header + ciphertext).
async function encryptWebPushPayload(
  plaintext: Uint8Array,
  p256dhB64url: string,   // browser's public key (base64url, 65 bytes uncompressed)
  authB64url: string,     // browser's auth secret (base64url, 16 bytes)
): Promise<Uint8Array> {
  // 1. Generate ephemeral ECDH server keypair
  const serverECDH = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"],
  );
  const serverPubKeyRaw = new Uint8Array(await crypto.subtle.exportKey("raw", serverECDH.publicKey)); // 65 bytes

  // 2. Import browser's P-256 public key
  const browserPubKeyBytes = b64urlDecode(p256dhB64url);
  const browserECDHKey = await crypto.subtle.importKey(
    "raw",
    browserPubKeyBytes,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    [],
  );

  // 3. ECDH shared secret
  const ecdhBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: browserECDHKey },
    serverECDH.privateKey,
    256,
  );
  const ecdhSecret = new Uint8Array(ecdhBits); // 32 bytes

  // 4. Auth secret
  const authSecret = b64urlDecode(authB64url); // 16 bytes

  // 5. Derive PRK: HKDF(salt=auth_secret, ikm=ecdh_secret, info="WebPush: info\0" || browser_pub || server_pub, L=32)
  const authInfo = concat(
    textEncode("WebPush: info\x00"),
    browserPubKeyBytes,
    serverPubKeyRaw,
  );
  const prk = await hkdf(ecdhSecret, authSecret, authInfo, 32);

  // 6. Random salt (16 bytes)
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // 7. Derive CEK and nonce from PRK
  // info strings per RFC 8188 aes128gcm
  const cek   = await hkdf(prk, salt, textEncode("Content-Encoding: aes128gcm\x00"), 16);
  const nonce = await hkdf(prk, salt, textEncode("Content-Encoding: nonce\x00"), 12);

  // 8. Encrypt: AES-128-GCM(key=cek, iv=nonce, plaintext=plaintext || 0x02)
  // 0x02 = RFC 8188 "last record" delimiter
  const paddedPlaintext = concat(plaintext, new Uint8Array([0x02]));
  const aesKey = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const ciphertextBuf = await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aesKey, paddedPlaintext);
  const ciphertext = new Uint8Array(ciphertextBuf);

  // 9. Build RFC 8188 aes128gcm header:
  //    salt (16) || rs (4, BE, = 4096) || idlen (1, = 65) || server_pub_key (65)
  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096, false); // record size = 4096
  const idlen = new Uint8Array([serverPubKeyRaw.length]); // 65

  return concat(salt, rs, idlen, serverPubKeyRaw, ciphertext);
}

// ── VAPID JWT ─────────────────────────────────────────────────────────────────
async function getVAPIDSigningKey(privateKeyB64url: string, publicKeyB64url: string): Promise<CryptoKey> {
  // Extract x, y from the uncompressed public key (04 || x || y)
  const pub = b64urlDecode(publicKeyB64url);
  const x = b64urlEncode(pub.slice(1, 33));
  const y = b64urlEncode(pub.slice(33, 65));
  return crypto.subtle.importKey(
    "jwk",
    { kty: "EC", crv: "P-256", d: privateKeyB64url, x, y, key_ops: ["sign"] },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
}

async function createVAPIDJWT(endpoint: string, signingKey: CryptoKey, subject: string): Promise<string> {
  const audience = new URL(endpoint).origin;
  const exp = Math.floor(Date.now() / 1000) + 12 * 3600;
  const header  = b64urlEncode(textEncode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const payload = b64urlEncode(textEncode(JSON.stringify({ aud: audience, exp, sub: subject })));
  const input = `${header}.${payload}`;
  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    signingKey,
    textEncode(input),
  );
  return `${input}.${b64urlEncode(new Uint8Array(sig))}`;
}

// ── Send a single Web Push notification ──────────────────────────────────────
async function sendWebPush(
  sub: PushSub,
  notif: NotifPayload,
  vapidPublicKey: string,
  vapidSigningKey: CryptoKey,
): Promise<{ ok: boolean; status?: number; error?: string }> {
  try {
    const jwt = await createVAPIDJWT(sub.endpoint, vapidSigningKey, "mailto:enid@enid-hub.local");
    const plaintext = textEncode(JSON.stringify(notif));
    const encryptedBody = await encryptWebPushPayload(plaintext, sub.p256dh, sub.auth);

    const res = await fetch(sub.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "aes128gcm",
        "TTL": "86400",                                   // keep for 24 hrs if device offline
        "Authorization": `vapid t=${jwt},k=${vapidPublicKey}`,
        "Urgency": "normal",
      },
      body: encryptedBody,
    });

    if (res.status === 410 || res.status === 404) {
      // Subscription expired — caller should delete it
      return { ok: false, status: res.status, error: "subscription_expired" };
    }
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, status: res.status, error: body };
    }
    return { ok: true, status: res.status };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────
const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const JSON_CORS = { "Content-Type": "application/json", ...CORS };

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: JSON_CORS });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  // ── Read env ───────────────────────────────────────────────────────────────
  const VAPID_PUBLIC_KEY  = Deno.env.get("VAPID_PUBLIC_KEY")!;
  const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
  const SUPABASE_URL      = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SVCKEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return json({ error: "VAPID keys not configured" }, 500);
  }

  // ── Parse request body ─────────────────────────────────────────────────────
  let body: Record<string, string> = {};
  try { body = await req.json(); } catch { /* empty body = ok */ }

  let notif: NotifPayload;
  if (body.title && body.body) {
    notif = { title: body.title, body: body.body, tag: body.tag, url: body.url };
  } else if (body.type && MESSAGE_BANKS[body.type]) {
    notif = pickMessage(MESSAGE_BANKS[body.type]);
  } else {
    return json({ error: 'Body must have { "type": "morning"|"afterwork"|"evening"|"weekend" } or { "title", "body" }' }, 400);
  }
  notif.url ??= "/enid-hub/";

  // ── Load push subscriptions ────────────────────────────────────────────────
  const supabase = createClient(SUPABASE_URL, SUPABASE_SVCKEY);
  const { data: subs, error: subErr } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", "ENID");

  if (subErr)                        return json({ error: subErr.message }, 500);
  if (!subs || subs.length === 0)    return json({ ok: true, sent: 0, message: "No subscriptions found" });

  // ── Send to all subscriptions ──────────────────────────────────────────────
  const signingKey = await getVAPIDSigningKey(VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY);
  const expiredEndpoints: string[] = [];
  const results = await Promise.allSettled(
    (subs as PushSub[]).map(async (sub) => {
      const result = await sendWebPush(sub, notif, VAPID_PUBLIC_KEY, signingKey);
      if (result.error === "subscription_expired") expiredEndpoints.push(sub.endpoint);
      return { endpoint: sub.endpoint, ...result };
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
