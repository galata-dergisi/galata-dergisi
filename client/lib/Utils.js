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

export default class Utils {
  /**
   * Performs an HTTP GET request using Fetch API.
   * @param {string} URL
   * @returns {Promise.<Response>}
   */
  static async httpGet(URL, options) {
    options = { json: false, ...options };
    const response = await fetch(URL);

    if (!response.ok) throw new Error('Resonse was not OK.');

    if (options.json) return response.json();

    return response.text();
  }

  /**
   * Forces the browser to download the image (and cache it).
   * @param {string} src Image URL
   * @returns {Promise}
   */
  static preloadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.src = src;
    });
  }

  static getMagazineIndexAndPageFromURL(href) {
    const url = new URL(href);

    const legacyURLRegex = /^#magazines\/sayi(\d+)\/?(\d+)?$/;
    const matches = legacyURLRegex.test(url.hash)
      ? url.hash.match(legacyURLRegex)
      : url.pathname.match(/^\/dergiler\/sayi(\d+)(?:\/(\d+))?$/);

    if (!matches || matches.length < 2) {
      return null;
    }

    const [, index, page] = matches;

    return {
      page: Number(page === undefined ? 1 : page),
      index: Number(index),
    };
  }

  static isVisibleContent(content) {
    const div = document.createElement('div');
    div.innerHTML = content;

    return div.querySelector('img') || div.innerText.trim().length > 0;
  }
}
