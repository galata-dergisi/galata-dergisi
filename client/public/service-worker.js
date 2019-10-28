const CACHE_NAME = 'galatadergisi-cache-v0';

async function cleanUpObseleteCaches() {
  try {
    const cacheNames = await caches.keys();
    return Promise.all(cacheNames.map(cacheName => {
      if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
    }));
  } catch (ex) {
    console.trace(ex);
  }
}

async function cacheFirst(req) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(req);

    if (response) return response;

    const networkResponse = await fetch(req);
    cache.put(req, networkResponse.clone());
    return networkResponse;
  } catch (ex) {
    throw ex;
  }
}

async function networkOnly(req) {
  try {
    const networkResponse = await fetch(req);
    return networkResponse;
  } catch (ex) {
    throw ex;
  }
}

self.addEventListener('activate', e => e.waitUntil(cleanUpObseleteCaches()));

self.addEventListener('install', () => {
  console.log('service-worker is installed.');
});

self.addEventListener('fetch', e => {
  const { origin: currentOrigin } = new URL(location.href);
  const { origin: destinationOrigin } = new URL(e.request.url);

  //If the resource belongs to an external URL then serve with cache-first approach
  if (currentOrigin !== destinationOrigin) {
    return e.respondWith(cacheFirst(e.request));
  }

  e.respondWith(networkOnly(e.request));
});
