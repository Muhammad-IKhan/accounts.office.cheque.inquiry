//scripts/service-worker.js
const CACHE_NAME = 'sie-app-v1-cache';
const ASSETS_TO_CACHE  = [
  // '/accounts.office.cheque.inquiry/',  // Root path
  // '/accounts.office.cheque.inquiry/index.html',
  // '/accounts.office.cheque.inquiry/styles/style.css',
  // '/accounts.office.cheque.inquiry/scripts/script.js',
  // '/accounts.office.cheque.inquiry/public/data/data.xml',
  // '/',
  // '/index.html',
  // '/styles/styles.css',
  // '/scripts/main.js',
  // '/scripts/domElements.js',
  // '/scripts/eventListeners.js',
  // '/scripts/tableFunctions.js',
  // '/scripts/pagination.js',
  // '/scripts/xmlHandling.js',
  // '/scripts/errorHandling.js',
  // '/scripts/tableUtilities.js',
  // '/favicon.ico',
  '/accounts.office.cheque.inquiry/',
  '/accounts.office.cheque.inquiry/index.html',
  '/accounts.office.cheque.inquiry/scripts/main.js',
  '/accounts.office.cheque.inquiry/scripts/domElements.js',
  '/accounts.office.cheque.inquiry/scripts/eventListeners.js',
  '/accounts.office.cheque.inquiry/scripts/tableFunctions.js',
  '/accounts.office.cheque.inquiry/scripts/pagination.js',
  '/accounts.office.cheque.inquiry/scripts/utils.js',
  '/accounts.office.cheque.inquiry/scripts/xmlHandling.js'
];

// Rest of your service worker code...

// Install the service worker and cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching assets...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch((err) => {
                console.error('Failed to cache assets:', err);
            })
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
