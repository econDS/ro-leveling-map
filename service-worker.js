// All URLs are relative to this file so the worker works at /ro-leveling-map/ on GitHub Pages.
const CACHE_PREFIX = 'ro-leveling-map-';
const CACHE_NAME = `${CACHE_PREFIX}pwa-1`;
const APP_ROOT = new URL('./', self.location.href);
const APP_SHELL = [
  './',
  './manifest.webmanifest',
  './icons/ro-exp-180.png',
  './icons/ro-exp-192.png',
  './icons/ro-exp-512.png',
  './assets/formulas.css',
  './assets/theme.css',
  './assets/data/ep20.js',
  './assets/data/spotlight-maps.js',
  './assets/data/spotlight-coverage.js',
  './assets/data/spotlight-2026.js',
  './assets/data/spotlight-2025.js',
  './assets/data/monster-races.js',
  './assets/settings.js',
  './assets/data/map-geometry.js',
  './assets/data/planning-context.js',
  './assets/calculator.js',
  './assets/data/maps.js',
  './assets/formulas.js',
  './assets/ui.js',
  './assets/monsters/1002.png',
  './assets/items/101079_battle_manual_200.png',
  './assets/items/101238_event_kafra_buff_7_days.png',
  './assets/items/23962_upgraded_malangdo_cat_can.png',
  './assets/items/23207_premium_service_box.png',
  './assets/items/23165_premium_service_staff.png',
  './assets/items/450517_kafra_uniform_lt_gear.png',
  './assets/items/skill_307_rich_man_mr_kim.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const requests = APP_SHELL.map(path => new Request(new URL(path, APP_ROOT), {cache: 'reload'}));
    await cache.addAll(requests);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== APP_ROOT.origin || !url.pathname.startsWith(APP_ROOT.pathname)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Query strings in this site only version static files. Keep one cached copy per path.
    const cacheKey = request.mode === 'navigate' ? APP_ROOT.href : `${url.origin}${url.pathname}`;
    const fresh = request.mode === 'navigate' || ['script', 'style', 'manifest'].includes(request.destination);
    try {
      const response = await fetch(request, fresh ? {cache: 'no-store'} : undefined);
      if (response.ok) {
        try { await cache.put(cacheKey, response.clone()); } catch (_) { /* Storage can be full. */ }
      }
      return response;
    } catch (_) {
      return await cache.match(cacheKey) || (request.mode === 'navigate' ? await cache.match(APP_ROOT.href) : undefined) || Response.error();
    }
  })());
});
