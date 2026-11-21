// Service Worker for Offline Grocery & Medicine PWA
self.addEventListener('install', (_e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Pass API and WS through network directly
  if (e.request.url.includes('/api') || e.request.url.includes('/ws')) {
    return;
  }
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
