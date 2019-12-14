const path = require('path');
const express = require('express');
const mariadb = require('mariadb');
const compression = require('compression');
const MagazinesRouter = require('./MagazinesRouter.js');

const app = express();
const config = require('../config.js');
const pool = mariadb.createPool({
  ...config.db,
  connectionLimit: 100,
});
const PORT = process.env.PORT || 3000;
const magazinesRouter = new MagazinesRouter({
  databasePool: pool,
});

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - Received a request: ${req.url}`);
  next();
});

app.use(compression({ threshold: 0 }));
app.use(magazinesRouter.getRouter());
app.use(express.static(path.join(__dirname, '../client/public')));

const server = app.listen(PORT, '0.0.0.0', err => {
  if (err) {
    return console.trace(err);
  }

  console.log(`Server started listening from ${PORT}`);
});

function terminateServer() {
  return new Promise((resolve) => {
    server.close(resolve);
  });
}

function cleanup(signal) {
  Promise
    .all([
      pool.end(),
      terminateServer(),
    ])
    .then(() => console.log('Cleanup completed.'))
    .catch((err) => console.trace(err))
    .finally(() => process.kill(process.pid, signal));
}

process.once('SIGINT', () => cleanup('SIGINT'));
process.on('SIGTERM', () => cleanup('SIGTERM'));
process.on('SIGHUP', () => cleanup('SIGHUP'));
process.once('SIGUSR2', () => cleanup('SIGUSR2'));
