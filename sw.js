// ── Enid's Service Worker 🐺 ─────────────────────────────────────────────────
// Handles push notifications and offline caching

const CACHE_NAME = 'enid-hub-v1';
const URLS_TO_CACHE = [
  '/enid-hub/',
  '/enid-hub/index.html',
  '/enid-hub/analytics.html',
  '/enid-hub/journal.html',
  '/enid-hub/finance.html',
  '/enid-hub/movies.html',
  '/enid-hub/books.html',
  '/enid-hub/date-items.html',
];

// ── Enid-coded notification messages ────────────────────────────────────────

const MORNING_MESSAGES = [
  { title: "Rise & shine sparklepup!! ☀️🐺", body: "8AM means it's GO time. Your morning routine is waiting and it's not gonna do itself. You've got this!! 💜" },
  { title: "Good MORNING glowbug!! 🌅", body: "The version of you with her life together wakes up and does the thing. Be her today. Open the app!! 🐾✨" },
  { title: "HEY. Wake up. It's 8AM. 🐺☀️", body: "Your morning routine is literally just waiting for you. Make your bed first — two minutes, first win of the day!! 🛏️💜" },
  { title: "Roomie wake UP!! ☀️🌸", body: "Today has never happened before!! You get to decide what kind of day it becomes. Start with the morning routine. 🌈🐺" },
  { title: "Morning kickoff time sparklepup!! 🌅🔥", body: "Every morning you complete this list is a vote for the life you're building. Cast that vote RIGHT NOW!! 💪💜" },
  { title: "☀️ It's 8AM and you KNOW what that means!!", body: "Rise, grind, and absolutely slay your morning routine. Wash your face. Make your bed. EAT SOMETHING. Go go go!! 🐺🌸" },
  { title: "WAKE UP BESTIE 🐺✨", body: "The morning routine won't complete itself!! You've literally done this before and felt so good after. Do it again today. 💜☀️" },
];

const AFTERWORK_MESSAGES = [
  { title: "Work mode OFF!! 5:30 hits different 💼🐺", body: "First thing: change out of those work clothes RIGHT NOW. Signal your brain it's YOUR time now. Then open the app!! 👟💜" },
  { title: "Hey sparklepup — you survived the day!! 🎉", body: "Now it's after-work routine time. Clothes off, comfy outfit on, yoga or walk — just pick ONE. You've earned it!! 🧘🚶💜" },
  { title: "5:30PM and the after-work check-in is calling!! 💼✨", body: "Work is DONE. Now decompress the right way. Change, move your body, check SCC messages, one work block. You got this!! 🐺🔥" },
  { title: "Clocking out and INTO your routine 🐾💼", body: "The after-work habits are your transition from work-you to home-you. Change your clothes first. It actually helps, I promise!! 👗💜" },
  { title: "It's 5:30!! After-work routine time roomie!! 🌆🐺", body: "Yoga OR walk — you only need ONE. That's it. Then an hour of work and 15 minutes reading. So doable. Open the app!! 📖✨" },
];

const EVENING_MESSAGES = [
  { title: "10:30PM — evening routine time!! 🌙🐺", body: "That means start heading home if you're out!! The routine starts NOW, not when you get home. Lights out at 11:45. 💜🌙" },
  { title: "Hey!! It's 10:30PM glowbug 🌙✨", body: "Begin to head home. Wash your face. Brush your teeth. TV off by 11:20. You know the drill and you always feel better when you do it!! 🐺💜" },
  { title: "🌙 Evening routine warning sparklepup!!", body: "15 minutes until you should be wrapping up wherever you are!! Home by 11, face washed, teeth brushed, lights out at 11:45. You've GOT this!! 🐾" },
  { title: "Night routine o'clock!! 🌙🐺💜", body: "Your sleep matters SO much. Start heading home now. The routine is short — wash up, TV off, read a little, lights out. Future you will be SO grateful!! ✨" },
  { title: "10:30 and your future self is watching 👀🌙", body: "She needs you to do the evening routine RIGHT NOW. Head home. Wash face. Brush teeth. TV off at 11:20. Lights out 11:45. DO IT!! 🐺💜" },
  { title: "🌙 Hey!! Evening routine time!!", body: "I know you wanna stay up but your sleep is part of the life you're building!! Start winding down now. Wash your face. Get cozy. You did today!! 🌸🐺" },
  { title: "BEDTIME ROUTINE TIME glowbug!! 🌙💜", body: "10:30PM means the clock is ticking!! Head home if you're out. Wash up. TV off by 11:20. Lights out 11:45. You crushed today — now rest!! 🐾✨" },
];

const WEEKEND_MESSAGES = [
  { title: "Weekend essentials check-in!! 📋🐺", body: "It's the weekend and the big four are waiting: financial review, calendar reset, laundry, and Walk Semper!! Don't let Sunday evening panic hit — do it NOW!! 💜" },
  { title: "Hey sparklepup — weekend tasks!! 📋🌸", body: "Semper needs his walk. Your wallet needs a review. Your calendar needs a reset. Your laundry needs to happen. That's it!! Open the app!! 🐕💜" },
  { title: "🐕 Semper says it's weekend routine time!!", body: "That good boy needs his walk AND you need to do your financial review, calendar reset, and laundry!! Two birds, one stone — take Semper AND do a money check!! 💰🐺" },
  { title: "Weekend essentials are calling roomie!! 📋🐺", body: "Financial review so no bill surprises. Calendar reset so no schedule chaos. Laundry so you have clothes. Walk Semper so he's happy. GO!! 💜🌈" },
  { title: "It's the weekend and the list awaits!! 🌸📋", body: "Future-you on Monday NEEDS you to do the weekend essentials today!! 30 minutes of effort, whole week of peace. You know the drill!! 🐺💜✨" },
];

// ── Pick a message deterministically by day ──────────────────────────────────
function getDayMessage(messages) {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth()+1) * 100 + today.getDate();
  return messages[seed % messages.length];
}

// ── Inline SVG icons (no external icon files in enid-hub) ───────────────────
const ICON_SVG_192 = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Crect width='192' height='192' rx='40' fill='%23E84EA0'/%3E%3Ctext y='140' x='96' text-anchor='middle' font-size='120'%3E🐺%3C/text%3E%3C/svg%3E";
const BADGE_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' rx='20' fill='%23E84EA0'/%3E%3Ctext y='70' x='48' text-anchor='middle' font-size='60'%3E🐺%3C/text%3E%3C/svg%3E";

// ── Install event — cache core files ────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE).catch(() => {
        // Non-fatal if some files aren't cached yet
      });
    })
  );
  self.skipWaiting();
});

// ── Activate event — clean old caches ───────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch event — NETWORK FIRST, cache fallback ─────────────────────────────
// Always tries the network first so updates reach devices instantly.
// Falls back to cache only if offline. HTML files are never served stale.
self.addEventListener('fetch', event => {
  // Only handle GET requests for our own pages
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const isOurPage = url.origin === self.location.origin && url.pathname.startsWith('/enid-hub');

  if (isOurPage) {
    // Network-first: try fresh from server, cache as fallback
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // Got a fresh response — clone and update the cache
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return networkResponse;
        })
        .catch(() => {
          // Offline — serve from cache
          return caches.match(event.request);
        })
    );
  }
  // For all other requests (CDN fonts, Supabase API etc) — just fetch normally
});

// ── Push notification handler ────────────────────────────────────────────────
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch(e) {}

  const options = {
    body: data.body || "Your routines are waiting!! 🐺💜",
    icon: data.icon || ICON_SVG_192,
    badge: BADGE_SVG,
    vibrate: [100, 50, 100],
    tag: data.tag || 'enid-reminder',
    renotify: true,
    requireInteraction: false,
    actions: [
      { action: 'open', title: '🐺 Open Tracker' },
      { action: 'dismiss', title: 'Later' }
    ],
    data: { url: data.url || '/enid-hub/' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Enid's Tracker 🐺", options)
  );
});

// ── Notification click handler ────────────────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/enid-hub/';

  if (event.action === 'dismiss') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes('enid-hub') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      return clients.openWindow(url);
    })
  );
});

// ── Scheduled notification logic (called from main app via postMessage) ───────
self.addEventListener('message', event => {
  if (event.data?.type === 'SCHEDULE_NOTIFICATIONS') {
    scheduleAll();
  }
});

// ── In-SW scheduling via periodic checks ─────────────────────────────────────
// Note: True scheduling requires the app to be open or a push server.
// This SW handles the push payload when it arrives from the app's scheduler.

function scheduleAll() {
  // Handled by the main app's setInterval scheduler — SW just shows notifications
  // when triggered via postMessage from the app
}

// ── Triggered notification (from main app scheduler) ─────────────────────────
self.addEventListener('message', event => {
  if (event.data?.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag, url } = event.data;
    self.registration.showNotification(title, {
      body,
      icon: ICON_SVG_192,
      badge: BADGE_SVG,
      vibrate: [100, 50, 100, 50, 100],
      tag: tag || 'enid-reminder',
      renotify: true,
      requireInteraction: false,
      actions: [
        { action: 'open', title: '🐺 Open App' },
        { action: 'dismiss', title: 'Got it!' }
      ],
      data: { url: url || '/enid-hub/' }
    });
  }
});
