/* FoodOrder PWA: cache de la interfaz; nunca se almacenan respuestas de la API. */
const CACHE_NAME = 'foodorder-pwa-shell-v1';
const APP_ROOT = new URL('./', self.registration.scope).toString();
const APP_ORIGIN = new URL(APP_ROOT).origin;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll([APP_ROOT, new URL('assets/foodorder-icon.svg', APP_ROOT).toString()]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith('foodorder-pwa-') && key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Siempre intenta internet primero para obtener cambios recientes.
// Si se pierde internet, sirve recursos ya visitados o el shell anterior.
// La API Laravel usa otro origen y queda fuera del cache.
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== APP_ORIGIN || !url.href.startsWith(APP_ROOT)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') {
        await cache.put(request.mode === 'navigate' ? APP_ROOT : request, response.clone());
      }
      return response;
    } catch {
      const cached = await cache.match(request.mode === 'navigate' ? APP_ROOT : request);
      if (cached) return cached;
      return Response.error();
    }
  })());
});
