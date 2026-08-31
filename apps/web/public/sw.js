// TravelMind Service Worker
// Strategy:
// - App shell (HTML navigations): network-first, fall back to cached shell when offline.
// - All GETs (including /api) bypass the cache by default so we never serve stale
//   data after a refresh. /api is explicitly excluded for safety.
// - POST/PUT/PATCH/DELETE and any cross-origin request always go to the network.
// - On activate we purge every cache that doesn't match the current version,
//   so an old SW (e.g. travelmind-shell-v1) cannot replay stale responses.

const CACHE_VERSION = 'v2';
const CACHE_NAME = `travelmind-shell-${CACHE_VERSION}`;
const APP_SHELL = ['/', '/manifest.webmanifest', '/favicon.png', '/logo.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle GET. Everything else (POST/PUT/PATCH/DELETE) hits the network.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never cache API calls; always go to the network.
  if (url.pathname.startsWith('/api')) return;

  // Don't cache cross-origin requests.
  if (url.origin !== self.location.origin) return;

  // App shell (HTML navigations): network-first, cache fallback for offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match('/'))),
    );
    return;
  }

  // Static assets: stale-while-revalidate, but always start from the network
  // so users see fresh content on every refresh.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => (await caches.match(request)) || Response.error()),
  );
});
