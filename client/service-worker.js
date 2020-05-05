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

/* eslint no-restricted-globals: 1 */

const CACHE_NAME = 'galatadergisi-cache-v5';
const networkOnlyList = [
  /\/magazines\/sayi\d+\/audio\//,
];
const networkFirstList = [
  /\/magazines\/sayi\d+\/pages$/,
];

async function cleanUpObseleteCaches() {
  try {
    const cacheNames = await caches.keys();
    const deletionPromises = cacheNames
      .filter((cacheName) => cacheName !== CACHE_NAME)
      .map((cacheName) => caches.delete(cacheName));

    await deletionPromises;
  } catch (ex) {
    console.trace(ex);
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  const response = await cache.match(req);

  if (response) return response;

  const networkResponse = await fetch(req);

  if (!networkResponse || networkResponse.status !== 200) {
    return networkResponse;
  }

  cache.put(req, networkResponse.clone());
  return networkResponse;
}

async function networkFirst(req) {
  try {
    const networkResponse = await fetch(req);

    if (!networkResponse || networkResponse.status !== 200) {
      const cacheResponse = await caches.match(req);

      if (!cacheResponse) {
        return new Response('<h1>Service Worker Couldn\'t Fetch the Resource</h1><strong>Request failed</strong>', {
          headers: {
            'Content-Type': 'text/html',
          },
          status: 499,
        });
      }

      return cacheResponse;
    }

    const cache = await caches.open(CACHE_NAME);
    cache.put(req, networkResponse.clone());

    return networkResponse;
  } catch (ex) {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(req);

    if (response) {
      return response;
    }

    throw new Error('Resource is not available.');
  }
}

function networkOnly(req) {
  return fetch(req);
}

self.addEventListener('activate', (e) => e.waitUntil(cleanUpObseleteCaches()));

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll([
    '/bundle.css',
    '/bundle.js',
    '/favicon.png',
    '/global.css',
    '/index.html',
    '/legacy-player.js',
    '/fonts/akaDora.ttf',
    '/fonts/DistTh___.ttf',
    '/fonts/sanskrit.ttf',
    '/fonts/Stempel-Garamond-W01-Roman.woff',
    '/images/bant.jpg',
    '/images/first-shelf.png',
    '/images/header-logo.jpg',
    '/images/wall-bookshelf-first.png',
    '/images/wall-bookshelf.png',
  ])));
});

self.addEventListener('fetch', (e) => {
  const { origin: currentOrigin } = new URL(location.href);
  const { origin: destinationOrigin } = new URL(e.request.url);

  // If the resource belongs to an external URL then serve with cache-first approach
  if (currentOrigin !== destinationOrigin) {
    return e.respondWith(networkFirst(e.request));
  }

  for (const regex of networkFirstList) {
    if (regex.test(e.request.url)) {
      return e.respondWith(networkFirst(e.request));
    }
  }

  for (const regex of networkOnlyList) {
    if (regex.test(e.request.url)) {
      return e.respondWith(networkOnly(e.request));
    }
  }

  return e.respondWith(cacheFirst(e.request));
});
