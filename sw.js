const CACHE_NAME = 'swimmin-v7';
const ASSETS = [
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap'
];
self.addEventListener('install', function(event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function(cache) { return cache.addAll(ASSETS); }));
  self.skipWaiting();
});
self.addEventListener('activate', function(event) {
  event.waitUntil(caches.keys().then(function(keys) {
    return Promise.all(keys.filter(function(key) { return key !== CACHE_NAME; }).map(function(key) { return caches.delete(key); }));
  }));
  self.clients.claim();
});
self.addEventListener('fetch', function(event) {
  var url = event.request.url;
  if (url.includes('firestore.googleapis.com') || url.includes('firebase') || url.includes('googletagmanager') || url.includes('google-analytics')) { return; }
  if (url.includes('swimmin-fpn.html') || url.endsWith('/')) { event.respondWith(fetch(event.request)); return; }
  event.respondWith(caches.match(event.request).then(function(cached) {
    return cached || fetch(event.request).then(function(response) {
      if (response && response.status === 200) { var clone = response.clone(); caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); }); }
      return response;
    });
  }));
});
