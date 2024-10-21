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

const fs = require('fs');
const path = require('path');
const { Router } = require('express');

const Logger = require('../lib/Logger.js');
const CustomError = require('../lib/CustomError.js');

class MagazinesController {
  constructor(params) {
    this.databasePool = params.databasePool;
    this.staticPath = params.staticPath;

    this.cache = {
      lastModifiedDate: null,
      fileContent: null,
    };

    this.indexPath = path.join(this.staticPath, 'index.html');
    this.init();
  }

  async #getMagazines() {
    let conn;

    try {
      conn = await this.databasePool.getConnection();

      const rows = process.env.GALATA_DEV_MODE === '1'
        ? await conn.query('SELECT * FROM magazines WHERE visible = 1')
        : await conn.query('SELECT * FROM magazines WHERE visible = 1 AND publishDate < CURRENT_TIMESTAMP()');

      const result = {
        success: true,
        magazines: [],
      };

      for (const row of rows) {
        const {
          id, publishDateText, thumbnailURL, tableOfContents,
        } = row;
        result.magazines.push({
          index: Number(id),
          publishDateText,
          thumbnailURL,
          tableOfContents,
        });
      }

      return result;
    } catch (ex) {
      Logger.trace(ex);
      throw new CustomError('Something went wrong.');
    } finally {
      if (conn) conn.release();
    }
  }

  init() {
    this.router = Router();

    this.router.get('/', (...args) => this.serveIndex(...args));

    // return list of the magazines
    this.router.get('/magazines', (...args) => this.getMagazines(...args));

    // return HTML content of each page
    this.router.get('/magazines/:magazineIndex/pages', (...args) => this.getMagazine(...args));

    // DEV MODE: Serve audio files (nginx will perform this on the server)
    this.router.get('/magazines/:magazineIndex/audio/:audioFile', (req, res) => this.serveAudioFiles(req, res));

    // DEV MODE: Serve individual magazine URLs (nginx will perform this on the server)
    this.router.get(/^\/dergiler\/sayi\d+(?:\/\d+)?/, (...args) => this.serveIndex(...args));
  }

  getRouter() {
    return this.router;
  }

  async serveIndex(_, res) {
    try {
      const [stat, magazines] = await Promise.all([
        fs.promises.stat(this.indexPath),
        this.#getMagazines(),
      ]);

      // if (stat.mtime !== this.cache.lastModifiedDate) {
        this.cache.fileContent = await fs.promises.readFile(path.join(__dirname, '../../client/pages/homepage/index.html'), 'utf8');
        this.cache.lastModifiedDate = stat.mtime;
      // }

      const allMagazines = magazines.magazines
        .sort((a, b) => b.index - a.index)
        .map((magazine) => {
          const { index, publishDateText, thumbnailURL } = magazine;
          const title = `${publishDateText} - Sayı ${index}`;
          return `
          <tr>
            <td>
              <a href="/dergiler/sayi${index}"><img src="${thumbnailURL}" alt="${title}" title="${title}" /></a>
            </td>
            <td><a href="/dergiler/sayi${index}">Sayı ${index}, ${publishDateText}</a></td>
          </tr>`;
        });

      const noScriptContent = [
        '<noscript>',
        '<h1 align="center">Galata Dergisi - Tüm Sayılar</h1>',
        '<main>',
        '<table align="center">',
        '<thead>',
        '<tr>',
        '<th scope="col">Kapak Görseli</th>',
        '<th scope="col">Sayı ve Yayın Tarihi</th>',
        '</tr>',
        '</thead>',
        '<tbody>',
        ...allMagazines,
        '</tbody>',
        '</table>',
        '</main>',
        '</noscript>',
      ];

      res.set('content-type', 'text/html; charset=UTF-8');
      res.end(this.cache.fileContent.replace('<!--NO_SCRIPT_CONTENT-->', noScriptContent.join('\n')));
    } catch (ex) {
      Logger.trace(ex);
      res.status(500).end('<h1>Internal Server Error</h1>');
    }
  }

  serveAudioFiles(req, res) {
    const { magazineIndex, audioFile } = req.params;
    Logger.log('Serving audio file', path.join(this.staticPath, 'audio', magazineIndex, audioFile));

    if (/[\/\\]/.test(magazineIndex) || /[\/\\]/.test(audioFile)) {
      res.status(403).end('<h1>Invalid request</h1>');
      return;
    }

    const audioFilePath = path.join(magazineIndex, audioFile);
    if (audioFilePath.indexOf('.') !== audioFilePath.lastIndexOf('.')) {
      res.status(403).end('<h1>Invalid request</h1>');
      return;
    }

    res.sendFile(path.join(this.staticPath, 'audio', audioFilePath));
  }

  getMagazines(_, res) {
    return this.#getMagazines()
      .then((result) => res.status(200).json(result))
      .catch((error) => {
        if (error instanceof CustomError) {
          return res.status(200).json({ success: false, error: error.message });
        }

        res.status(200).json({ success: false, error: 'Something went wrong.' });
      });
  }

  async getMagazine(req, res) {
    let conn;
    const { magazineIndex } = req.params;

    try {
      conn = await this.databasePool.getConnection();
      const subQuery = process.env.GALATA_DEV_MODE === '1'
        ? 'SELECT id FROM magazines WHERE visible = 1 AND id = ?'
        : 'SELECT id FROM magazines WHERE visible = 1 AND id = ? AND publishDate < CURRENT_TIMESTAMP()';
      const rows = await conn.query(`SELECT * FROM pages WHERE magazineIndex = ? AND magazineIndex = (${subQuery})`, [
        +magazineIndex,
        +magazineIndex,
      ]);
      const result = {
        success: true,
        pages: {},
      };

      for (const row of rows) {
        if (row.alternativeContentUntil && Date.now() < row.alternativeContentUntil) {
          result.pages[row.pageNumber] = row.alternativeContent;
        } else {
          result.pages[row.pageNumber] = row.content;
        }
      }

      res.status(200).json(result);
    } catch (ex) {
      Logger.trace(ex);
      res.status(200).json({
        success: false,
        error: 'Someting went wrong.',
      });
    } finally {
      if (conn) conn.release();
    }
  }
}

module.exports = MagazinesController;
