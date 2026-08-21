// Minimaalinen service worker: mahdollistaa PWA-asennuksen ja välimuistittaa
// sovelluskuoren. RSS-hakuja (/api/*) ei koskaan välimuisteta, jotta otsikot
// pysyvät tuoreina.
importScripts('js/version.js');

const CACHE_NAME = 'morbo-' + APP_VERSION;

const CORE_ASSETS = [
  'index.html',
  'admin.html',
  'css/style.css',
  'js/cookies.js',
  'js/config.js',
  'js/i18n.js',
  'js/theme.js',
  'js/clock.js',
  'js/version.js',
  'js/dashboard.js',
  'js/admin.js',
  'manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) return;
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
