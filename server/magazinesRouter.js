const express = require('express');
const router = express.Router();

router.get('/magazines', (req, res) => {
  res.status(200).json([]);
});

module.exports = router;