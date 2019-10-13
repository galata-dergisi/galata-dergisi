const mariadb = require('mariadb');
const express = require('express');

const config = require('../config.js');
const pool = mariadb.createPool({
  ...config.db,
  connectionLimit: 100,
});
const router = express.Router();

router.get('/magazines', async (_, res) => {
  try {
    const conn = await pool.getConnection();
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
    conn.release();
  } catch (ex) {
    console.trace(ex);
    res.status(200).json({
      success: false,
      error: 'Someting went wrong.',
    });
  }
});

router.get('/magazines/:magazineIndex/pages/:pageQuery', async (req, res) => {
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
    try {
      const conn = await pool.getConnection();
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
      conn.release();
    } catch (ex) {
      console.trace(ex);
      res.status(200).json({
        success: false,
        error: 'Someting went wrong.',
      });
    }
  }
});

module.exports = router;
