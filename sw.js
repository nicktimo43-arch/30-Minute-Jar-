const CACHE_NAME = 'focus-jar-cache-v4';
const urlsToCache = [
  // Core files
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/plantGenerator.ts',
  '/lib/ai.ts',
  
  // Components
  '/components/MainTaskNote.tsx',
  '/components/NextUp.tsx',
  '/components/TaskPlanner.tsx',
  '/components/TimerScreen.tsx',
  '/components/PixelPlant.tsx',
  '/components/SyncModal.tsx',
  '/components/QrCodeModal.tsx',
  '/components/QrScanner.tsx',
  '/components/WeeklyHistoryModal.tsx',
  
  // PWA assets
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// Install a service worker
self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Use { cache: 'reload' } to ensure we are getting fresh files from the network
        const requests = urlsToCache.map(url => new Request(url, { cache: 'reload' }));
        return cache.addAll(requests);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Update a service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});