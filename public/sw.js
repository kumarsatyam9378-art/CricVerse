/* =========================================
   SERVICE WORKER (Production V1.0)
   Features: Offline Caching, Fast Loading
   ========================================= */

const CACHE_NAME = 'cricverse-v1-static';
const DATA_CACHE_NAME = 'cricverse-v1-data';

// Files to cache immediately for offline use
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/game.html',
  '/style.css',
  '/app.js',
  '/data.js',
  '/ai.js',
  '/manifest.json'
];

// 1. INSTALL EVENT
self.addEventListener('install', (evt) => {
  console.log('[ServiceWorker] Install');
  
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline page');
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// 2. ACTIVATE EVENT (Cleanup old caches)
self.addEventListener('activate', (evt) => {
  console.log('[ServiceWorker] Activate');
  
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );

  self.clients.claim();
});

// 3. FETCH EVENT (Intercept network requests)
self.addEventListener('fetch', (evt) => {
  // A. Handle API Requests (Don't cache AI responses deeply, they are dynamic)
  if (evt.request.url.includes('pollinations.ai')) {
    return; // Let AI requests go to network always
  }

  // B. Handle Static Files (Cache First, Network Fallback)
  evt.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(evt.request).then((response) => {
        return response || fetch(evt.request);
      });
    })
  );
});
