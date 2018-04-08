// const staticAccess = [
//     './Headline/',
//     './Headline/css/style.css',
//     './Headline/js/app.js',
//     './Headlin/js/lib/idb.js',
//     './Headline/images/error-icon.png',
//     './Headline/js/fallback.json'

// ];
self.addEventListener('install', async event => {
    const cache = await caches.open('headline-static');
    cache.addAll([
        './Headline/',
        './Headline/css/style.css',
        './Headline/js/app.js',
        './Headlin/js/lib/idb.js',
        './Headline/images/error-icon.png',
        './Headline/js/fallback.json'

    ]);
});

self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    if (url.origin === location.origin) {
        event.respondWith(cacheFirst(request));
    } else {
		console.log("e");
        event.respondWith(networkFirst(request));
    }
})

async function cacheFirst(req) {
    const cachedReponse = await caches.match(req);
    return cachedReponse || fetch(req);
}

async function networkFirst(req) {
    const cache = await caches.open('headline-dynamic');
    try {
        const res = await fetch(req);
        cache.put(req, res.clone());
        return res;
    } catch (error) {
        const cachedReponse = await cache.match(req);
        return cachedReponse || await caches.match('./../Headline/js/fallback.json');
    }
}