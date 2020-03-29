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

/**
 * Performs an HTTP GET request using Fetch API.
 * @param {string} URL 
 * @returns {Promise.<Response>}
 */
export async function httpGet(URL, options) {
  try {
    options = Object.assign({}, { json: false }, options);
    const response = await fetch(URL);

    if (!response.ok) throw new Error(`Resonse was not OK.`);

    if (options.json) return response.json();

    return response.text();
  } catch (ex) {
    throw ex;
  }
}

/**
 * Adds a **one-time** listener function (`callback`) to the target HTML element for the event named `eventName`.
 * @param {HTMLElement} target Target element.
 * @param {string} eventName The name of the event.
 * @param {function} callback The callback function.
 */
export function once(target, eventName, callback) {
  const handler = function (...args) {
    target.removeEventListener(eventName, handler);
    callback(...args);
  };

  target.addEventListener(eventName, handler);
}

/**
 * Forces the browser to download the image (and cache it).
 * @param {string} src Image URL 
 * @returns {Promise}
 */
export function preloadImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = resolve;
    img.src = src;
  });
}

export function getMagazineIndexAndPageFromCurrentLocation() {
  const url = new URL(location.href);
  const matches = url.pathname.match(/^\/magazines\/sayi(\d+)\/(\d+)$/);

  if (matches.length !== 3) {
    return null;
  }

  const [, index, page] = matches;

  return { 
    page: Number(page),
    index: Number(index), 
  };
}
