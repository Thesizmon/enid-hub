// ── Enid's Service Worker 🐺 ─────────────────────────────────────────────────
// Handles push notifications, discipline mode, and offline caching

const CACHE_NAME = 'enid-hub-v3'; // bumped — discipline mode added
const URLS_TO_CACHE = [
  '/enid-hub/',
  '/enid-hub/index.html',
  '/enid-hub/analytics.html',
  '/enid-hub/journal.html',
  '/enid-hub/finance.html',
  '/enid-hub/movies.html',
  '/enid-hub/books.html',
  '/enid-hub/date-items.html',
  '/enid-hub/badges.html',
  // cards.html (~4MB) intentionally omitted from pre-cache — too large for offline storage
];

// ── Inline SVG icons ────────────────────────────────────────────────────────
const ICON_SVG_192 = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Crect width='192' height='192' rx='40' fill='%23E84EA0'/%3E%3Ctext y='140' x='96' text-anchor='middle' font-size='120'%3E🐺%3C/text%3E%3C/svg%3E";
const BADGE_SVG   = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' rx='20' fill='%23E84EA0'/%3E%3Ctext y='70' x='48' text-anchor='middle' font-size='60'%3E🐺%3C/text%3E%3C/svg%3E";

// ── Discipline Mode notification button sets ────────────────────────────────
// subtype → action buttons shown on the notification
const DISCIPLINE_ACTIONS = {
  routine_trigger: [
    { action: 'start',  title: '🐾 Start'       },
    { action: 'snooze', title: '⏰ Snooze 10'   },
    { action: 'skip',   title: '⏭ Skip'         },
  ],
  completion_check: [
    { action: 'done',         title: '✅ Done!!'       },
    { action: 'still_working', title: '⏳ Still Working' },
    { action: 'abandon',      title: '❌ Abandon'       },
  ],
  lunch_trigger: [
    { action: 'lunch_1',   title: '🕐 Back 1:00'  },
    { action: 'lunch_130', title: '🕑 Back 1:30'  },
    { action: 'lunch_2',   title: '🕑 Back 2:00'  },
  ],
  wind_down_check: [
    { action: 'done',      title: '🌙 Sleep Time!!' },
    { action: 'ten_more',  title: '⏰ 10 More Min'  },
    { action: 'abandon',   title: '❌ Abandon'       },
  ],
  go_home: [
    { action: 'start',  title: '🚗 Heading Home' },
    { action: 'snooze', title: '⏰ Snooze 10'    },
    { action: 'skip',   title: '⏭ Skip'          },
  ],
};

// ── Vibration patterns per escalation stage ─────────────────────────────────
const STAGE_VIBRATE = {
  1: [100, 50, 100],
  2: [200, 100, 200],
  3: [500, 200, 500, 200, 500],
  4: [800, 300, 800, 300, 800, 300, 800],
};

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE).catch(() => {}))
  );
  self.skipWaiting();
});

// ── Activate — clean old caches ──────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch — network first, cache fallback ────────────────────────────────────
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin === self.location.origin && url.pathname.startsWith('/enid-hub')) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
  }
});

// ── Push notification handler (server-sent) ──────────────────────────────────
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch(e) {}

  const subtype = data.subtype || 'routine_trigger';
  const stage   = data.stage   || 1;

  const options = buildNotifOptions({
    body:      data.body      || "Your routines are waiting!! 🐺💜",
    subtype,
    stage,
    routineId: data.routineId || null,
    tag:       data.tag       || 'enid-reminder',
    url:       data.url       || '/enid-hub/',
    fullscreen: data.fullscreen || false,
  });

  event.waitUntil(
    self.registration.showNotification(data.title || "Enid's Tracker 🐺", options)
  );
});

// ── Unified message handler (from main app) ──────────────────────────────────
self.addEventListener('message', event => {
  const msg = event.data || {};

  // Legacy: simple notification
  if (msg.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(msg.title, buildNotifOptions({
      body:    msg.body,
      subtype: msg.subtype || 'routine_trigger',
      stage:   msg.stage   || 1,
      routineId: msg.routineId || null,
      tag:     msg.tag     || 'enid-reminder',
      url:     msg.url     || '/enid-hub/',
    }));
    return;
  }

  // Discipline mode notification
  if (msg.type === 'DISCIPLINE_NOTIFY') {
    self.registration.showNotification(msg.title, buildNotifOptions({
      body:      msg.body,
      subtype:   msg.subtype   || 'routine_trigger',
      stage:     msg.stage     || 1,
      routineId: msg.routineId || null,
      tag:       msg.tag       || `discipline-${msg.routineId}`,
      url:       '/enid-hub/',
      fullscreen: msg.stage >= 4,
    }));
    return;
  }

  // Legacy schedule trigger (no-op — scheduling handled in app)
  if (msg.type === 'SCHEDULE_NOTIFICATIONS') { return; }
});

// ── Build notification options ────────────────────────────────────────────────
function buildNotifOptions({ body, subtype, stage, routineId, tag, url, fullscreen }) {
  const actions  = DISCIPLINE_ACTIONS[subtype] || DISCIPLINE_ACTIONS.routine_trigger;
  const vibrate  = STAGE_VIBRATE[stage] || STAGE_VIBRATE[1];
  // Stage 2+ stays on screen until dismissed; Stage 3+ gets extra urgency
  const requireInteraction = stage >= 2;

  return {
    body,
    icon:    ICON_SVG_192,
    badge:   BADGE_SVG,
    vibrate,
    tag,
    renotify:            true,
    requireInteraction,
    silent:              false,
    actions,
    data: { url, routineId, stage, fullscreen },
  };
}

// ── Notification click handler ────────────────────────────────────────────────
self.addEventListener('notificationclick', event => {
  const notifData  = event.notification.data || {};
  const action     = event.action;            // 'start' | 'snooze' | 'skip' | 'done' | etc.
  const routineId  = notifData.routineId;
  const stage      = notifData.stage || 1;
  const openUrl    = notifData.url || '/enid-hub/';
  const fullscreen = notifData.fullscreen || stage >= 4;

  event.notification.close();

  // Dismiss with no action
  if (action === 'dismiss') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {

      // Post ROUTINE_ACTION to all open app clients
      if (action && routineId) {
        clientList.forEach(c => {
          if (c.url.includes('enid-hub')) {
            c.postMessage({ type: 'ROUTINE_ACTION', action, routineId });
          }
        });
      }

      // Find existing enid-hub client
      const existing = clientList.find(c => c.url.includes('enid-hub') && 'focus' in c);

      // For Start/Done actions, open/focus app with discipline overlay data
      if (!action || action === 'start' || action === 'done' || fullscreen) {
        if (existing) {
          existing.postMessage({ type: 'ROUTINE_OPEN', routineId, action, fullscreen });
          return existing.focus();
        }
        return clients.openWindow(`${openUrl}?discipline=${routineId || ''}&action=${action || ''}`);
      }

      // For snooze/skip/abandon — no need to open app, just send message if open
      // Message already sent above; nothing else needed
    })
  );
});
