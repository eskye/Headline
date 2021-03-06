var cacheName = 'headline-post-v3';
const appShellFiles = [
    './Headline/',
    './Headline/css/style.css',
    './Headline/js/app.js',
    './Headline/js/lib/idb.js',
    './Headline/images/error-icon.png',
    './Headline/js/fallback.json'

];



self.addEventListener('install', (e) => {
    console.log('[ServiceWorker] Install done');
    e.waitUntil(
        caches.open(cacheName).then((cache) => {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(appShellFiles);
        })
    );
});


self.addEventListener('activate', (e) => {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== cacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});


self.addEventListener('fetch', function(e) {
    console.log('[ServiceWorker] Fetch', e.request.url);
    // caching images
    if (e.request.url.endsWith('.jpg') || e.request.url.endsWith('.png')) {
        e.respondWith(
            caches.match(e.request).then(response => {
                if (response) {
                    console.log('[ServiceWorker] Fetch found in cache', e.request.url);
                    return response
                };
                fetch(e.request.clone()).then(response => {
                    if (!response) {
                        console.log("[Service worker] no response fetch");
                        return response;
                    }
                    caches.open(cacheName).then(cache => {
                        cache.put(e.request, response.clone());
                        return response;
                    });
                }).catch(err => {
                    console.log("[Service worker] Error fetching and caching");
                });
            })
        );
    }
});