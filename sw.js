const CACHE_NAME = 'lista-compras-v1';
const ARQUIVOS_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json'
];

// Instalação
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ARQUIVOS_CACHE))
    );
    self.skipWaiting();
});

// Ativação
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
});

// Busca — servir do cache quando offline
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then(resp => resp || fetch(e.request))
    );
});