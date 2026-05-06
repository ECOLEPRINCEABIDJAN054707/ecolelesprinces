const CACHE_NAME = 'les-princes-v1';
const URLS_A_CACHER = [
  '/ecolelesprinces/',
  '/ecolelesprinces/index.html',
  '/ecolelesprinces/enseignant_cpp.html',
  '/ecolelesprinces/manifest.json',
  '/ecolelesprinces/ecole.jpg'
];

// Installation — mettre en cache
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(URLS_A_CACHER);
    })
  );
  self.skipWaiting();
});

// Activation — supprimer ancien cache
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

// Fetch — servir depuis cache si disponible
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) return response;
      return fetch(event.request).catch(function() {
        return caches.match('/ecolelesprinces/index.html');
      });
    })
  );
});
