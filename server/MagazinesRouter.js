const { Router } = require('express');

class MagazinesRouter {
  constructor(params) {
    this.databasePool = params.databasePool;
    this.init();
  }

  init() {
    this.router = Router();
    this.router.get('/magazines', (...args) => this.getMagazines(...args));
    this.router.get('/magazines/:magazineIndex/pages/:pageQuery', (...args) => this.getMagazine(...args));
  }

  getRouter() {
    return this.router;
  }

  async getMagazines(req, res) {
    let conn;

    try {
      conn = await this.databasePool.getConnection();
      const rows = await conn.query('SELECT id, publishDateText, numberOfPages, thumbnailURL FROM magazines');
      const result = {
        success: true,
        magazines: [],
      };

      for (const row of rows) {
        const { id, publishDateText, numberOfPages, thumbnailURL } = row;
        result.magazines.push({
          index: +id,
          publishDateText,
          numberOfPages,
          thumbnailURL,
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
    const { magazineIndex, pageQuery } = req.params;
    let pageStart;
    let pageEnd;

    if (pageQuery.includes(',')) {
      [pageStart, pageEnd] = pageQuery.split(',');
    } else {
      pageStart = pageEnd = pageQuery;
    }

    //Old magazines
    if (magazineIndex <= 36) {
      let conn;

      try {
        conn = await this.databasePool.getConnection();
        const rows = await conn.query('SELECT `content`, pageNumber FROM `oldassets` WHERE magazineIndex = ? AND pageNumber >= ? AND pageNumber <= ?', [
          +magazineIndex,
          +pageStart,
          +pageEnd,
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
}

module.exports = MagazinesRouter;
