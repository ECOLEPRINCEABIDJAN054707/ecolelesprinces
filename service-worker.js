importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// ─── CONFIGURATION FIREBASE ───────────────────────────────
firebase.initializeApp({
  apiKey: "AIzaSyDtH88yVNazbUtPH45-elt0lufBa3guad4",
  authDomain: "cpp-les-princes.firebaseapp.com",
  projectId: "cpp-les-princes",
  storageBucket: "cpp-les-princes.firebasestorage.app",
  messagingSenderId: "820225042885",
  appId: "1:820225042885:web:7b0a6bbecc048a5eef83ac"
});

const messaging = firebase.messaging();

// ─── NOM DU CACHE ─────────────────────────────────────────
const CACHE_NAME = 'les-princes-v3';
const URLS_A_CACHER = [
  '/ecolelesprinces/',
  '/ecolelesprinces/index.html',
  '/ecolelesprinces/enseignant_cpp.html',
  '/ecolelesprinces/manifest.json',
  '/ecolelesprinces/ecole.jpg'
];

// ─── INSTALLATION ─────────────────────────────────────────
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(URLS_A_CACHER);
    })
  );
  self.skipWaiting();
});

// ─── ACTIVATION ───────────────────────────────────────────
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

// ─── FETCH — RÉSEAU EN PRIORITÉ ───────────────────────────
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

// ─── NOTIFICATIONS PUSH FCM ───────────────────────────────
// Notifications reçues quand l'app est en arrière-plan
messaging.onBackgroundMessage(function(payload) {
  var data = payload.data || payload.notification || {};
  var titre = data.titre || data.title || 'Ecole Les Princes';
  var message = data.message || data.body || '';
  var url = data.url || '/ecolelesprinces/';

  var options = {
    body: message,
    icon: '/ecolelesprinces/ecole.png',
    badge: '/ecolelesprinces/ecole.png',
    vibrate: [200, 100, 200],
    requireInteraction: false,
    data: { url: url },
    actions: [
      { action: 'ouvrir', title: 'Voir' }
    ]
  };

  return self.registration.showNotification(titre, options);
});

// ─── CLIC SUR NOTIFICATION ────────────────────────────────
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var urlCible = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : '/ecolelesprinces/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then(function(clientList) {
      // Si le portail est déjà ouvert → focus
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.indexOf('ecolelesprinces') >= 0 && 'focus' in client) {
          return client.focus();
        }
      }
      // Sinon → ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(urlCible);
      }
    })
  );
});

// ─── FERMETURE NOTIFICATION ───────────────────────────────
self.addEventListener('notificationclose', function(event) {
  // Optionnel : logger la fermeture
});
