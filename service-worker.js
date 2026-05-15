const CACHE_NAME = 'les-princes-v2';
const URLS_A_CACHER = [
  '/ecolelesprinces/',
  '/ecolelesprinces/index.html',
  '/ecolelesprinces/enseignant_cpp.html',
  '/ecolelesprinces/manifest.json',
  '/ecolelesprinces/ecole.jpg'
];

// Installation — mettre en cache la nouvelle version
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(URLS_A_CACHER);
    })
  );
  self.skipWaiting();
});

// Activation — supprimer l'ancien cache v1
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

// Fetch — RESEAU EN PRIORITE, cache seulement si hors ligne
self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request).then(function(response) {
      if (response && response.status === 200) {
        var responseClone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseClone);
        });
      }
      return response;
    }).catch(function() {
      return caches.match(event.request).then(function(cached) {
        return cached || caches.match('/ecolelesprinces/index.html');
      });
    })
  );
});
