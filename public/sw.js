/* Service Worker - Pedra en Sec (PWA)
   Estrategia:
   - Navegación  -> network-first con fallback al shell cacheado (offline).
   - Datos JSON/GeoJSON -> network-first, cae a cache si no hay red.
   - Estáticos   -> cache-first, luego red (y se cachea).
   Sube la versión del CACHE para forzar actualización del SW. */
const CACHE = 'pedra-en-sec-v1';

// Precarga mínima del shell. El JS/CSS con hash se cachea en runtime.
const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './hiker.svg',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isData = /\/data\/.*\.(json|geojson)$/.test(url.pathname);
  const isNavigation = request.mode === 'navigate';

  // Navegación: network-first, fallback al shell (offline)
  if (isNavigation) {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('./index.html').then((r) => r || caches.match('./')),
      ),
    );
    return;
  }

  // Datos: network-first, cae a cache
  if (isData) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  // Estáticos: cache-first, luego red (y cachea)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
        }
        return res;
      });
    }),
  );
});
