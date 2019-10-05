const path = require('path');
const express = require('express');
const compression = require('compression');
const magazinesRouter = require('./magazinesRouter');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression({ threshold: 0 }));
app.use(magazinesRouter);
app.use(express.static(path.join(__dirname, '../client/public')));

app.listen(PORT, '0.0.0.0', err => {
  if (err) return console.trace(err);

  console.log(`Server started listening from ${PORT}`);
});