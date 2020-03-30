// Copyright 2020 Mehmet Baker
// 
// This file is part of galata-dergisi.
// 
// galata-dergisi is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// galata-dergisi is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with galata-dergisi. If not, see <https://www.gnu.org/licenses/>.

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
