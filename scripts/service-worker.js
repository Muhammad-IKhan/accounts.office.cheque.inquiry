//scripts/service-worker.js
const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [
  '/accounts.office.cheque.inquiry/',  // Root path
  '/accounts.office.cheque.inquiry/index.html',
  '/accounts.office.cheque.inquiry/styles/style.css',
  '/accounts.office.cheque.inquiry/scripts/script.js',
  '/accounts.office.cheque.inquiry/public/data/data.xml'
];

// Rest of your service worker code...

// Install the service worker and cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Serve cached resources when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
