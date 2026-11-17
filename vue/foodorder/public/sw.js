/* FoodOrder Admin PWA. Solo cachea recursos web de este subdirectorio,
 * nunca respuestas ni tokens de la API Laravel (origen externo). */
const CACHE_NAME = 'foodorder-admin-pwa-v1';
const ROOT = self.registration.scope;
const ROOT_URL = new URL(ROOT);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll([ROOT, new URL('pwa-icon-192.png', ROOT).toString()]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith('foodorder-admin-pwa-') && key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== ROOT_URL.origin ||
      !url.pathname.startsWith(ROOT_URL.pathname)) return;
  // El panel y sus recursos se solicitan primero por la red para detectar cambios.
  // Solo se conserva un respaldo estático, nunca pedidos ni datos de sesión.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') {
        await cache.put(request.mode === 'navigate' ? ROOT : request, response.clone());
      }
      return response;
    } catch {
      const cached = await cache.match(request.mode === 'navigate' ? ROOT : request);
      return cached || Response.error();
    }
  })());
});
