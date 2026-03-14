const CACHE_NAME = 'swimmin-v1';
const ASSETS = [
  './',
  './swimmin-fpn.html',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap'
];

// Instalar e fazer cache dos assets principais
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Limpar caches antigos na activação
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Estratégia: Network first, fallback para cache
self.addEventListener('fetch', function(event) {
  // Ignorar pedidos ao Firebase e Google Analytics (sempre online)
  var url = event.request.url;
  if (
    url.includes('firestore.googleapis.com') ||
    url.includes('firebase') ||
    url.includes('googletagmanager') ||
    url.includes('google-analytics')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // Guardar cópia no cache se for um pedido GET bem sucedido
        if (event.request.method === 'GET' && response && response.status === 200) {
          var responseClone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(function() {
        // Sem rede — servir do cache
        return caches.match(event.request).then(function(cached) {
          return cached || caches.match('./swimmin-fpn.html');
        });
      })
  );
});
