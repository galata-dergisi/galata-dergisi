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

const { Router } = require('express');

class MagazinesRouter {
  constructor(params) {
    this.databasePool = params.databasePool;
    this.init();
  }

  init() {
    this.router = Router();
    this.router.get('/magazines', (...args) => this.getMagazines(...args));
    this.router.get('/magazines/:magazineIndex/pages', (...args) => this.getMagazine(...args));
  }

  getRouter() {
    return this.router;
  }

  async getMagazines(req, res) {
    let conn;

    try {
      conn = await this.databasePool.getConnection();
      const rows = await conn.query('SELECT id, publishDateText, numberOfPages, thumbnailURL, '
        + 'tableOfContents FROM magazines WHERE visible = 1 AND publishDate < CURRENT_TIMESTAMP()');
      const result = {
        success: true,
        magazines: [],
      };

      for (const row of rows) {
        const { id, publishDateText, numberOfPages, thumbnailURL, tableOfContents } = row;
        result.magazines.push({
          index: +id,
          publishDateText,
          numberOfPages,
          thumbnailURL,
          tableOfContents,
        });
      }

      res.status(200).json(result);
    } catch (ex) {
      console.trace(ex);
      res.status(200).json({
        success: false,
        error: 'Someting went wrong.',
      });
    } finally {
      if (conn) conn.release();
    }
  }

  async getMagazine(req, res) {
    let conn;
    const { magazineIndex } = req.params;

    try {
      conn = await this.databasePool.getConnection();
      const rows = await conn.query('SELECT `content`, pageNumber FROM pages '
        + 'WHERE magazineIndex = ? AND magazineIndex = (SELECT id FROM magazines '
        + 'WHERE visible = 1 AND publishDate < CURRENT_TIMESTAMP() AND id = ?)', [
        +magazineIndex,
        +magazineIndex,
      ]);
      const result = {
        success: true,
        pages: {},
      };

      for (const row of rows) {
        result.pages[row.pageNumber] = row.content;
      }

      res.status(200).json(result);
    } catch (ex) {
      console.trace(ex);
      res.status(200).json({
        success: false,
        error: 'Someting went wrong.',
      });
    } finally {
      if (conn) conn.release();
    }
  }
}

module.exports = MagazinesRouter;
