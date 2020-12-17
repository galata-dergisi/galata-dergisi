#! /usr/bin/env node
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
const express = require('express');
const mariadb = require('mariadb');
const compression = require('compression');
const MagazinesController = require('./controllers/MagazinesController.js');
const ContributionsController = require('./controllers/ContributionsController.js');
const GDriveSync = require('./services/GDriveSync.js');
const Notifications = require('./services/Notifications.js');

const PORT = process.env.PORT || 3000;
const STATIC_PATH = path.join(__dirname, '../public');
const UPLOADS_DIR = path.join(__dirname, '../uploads');
const FONT_AWESOME_PATH = path.join(__dirname, '../node_modules/@fortawesome/fontawesome-free');

// HTTP server
let server;
const app = express();
const config = require('../config.js');

// Setting recursive to true prevents EEXIST errors
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Initialize MariaDB connection pool
const pool = mariadb.createPool({
  ...config.db,
});

function initServices() {
  GDriveSync.init({
    databasePool: pool,
    uploadsDir: UPLOADS_DIR,
  });

  Notifications.init({
    databasePool: pool,
  });
}

function initWebServer() {
  // Initialize magazines controller
  const magazinesController = new MagazinesController({
    databasePool: pool,
    staticPath: STATIC_PATH,
  });

  // Initialize contributions controller
  const contributionsController = new ContributionsController({
    databasePool: pool,
    staticPath: STATIC_PATH,
    uploadsDir: UPLOADS_DIR,
  });

  app.use(compression({ threshold: 0 }));
  app.use(contributionsController.getRouter());
  app.use(magazinesController.getRouter());
  app.use('/fontawesome', express.static(FONT_AWESOME_PATH));
  app.use(express.static(STATIC_PATH));

  server = app.listen(PORT, '0.0.0.0', (err) => {
    if (err) {
      console.trace(err);
      return;
    }

    console.log(`Server started listening from ${PORT}`);
  });
}

function terminateServer() {
  return new Promise((resolve) => {
    if (!server) {
      setImmediate(resolve);
      return;
    }

    server.close(resolve);
  });
}

function cleanup(signal = 'SIGTERM') {
  Promise
    .all([
      pool.end(),
      terminateServer(),
    ])
    .then(() => console.log('Cleanup completed.'))
    .catch((err) => {
      const isPoolClosedError = err && err.code === 'ER_POOL_ALREADY_CLOSED';
      if (!isPoolClosedError) {
        console.trace(err)
      }
    })
    .finally(() => process.kill(process.pid, signal));
}

process.once('SIGINT', () => cleanup('SIGINT'));
process.on('SIGTERM', () => cleanup('SIGTERM'));
process.on('SIGHUP', () => cleanup('SIGHUP'));
process.once('SIGUSR2', () => cleanup('SIGUSR2'));

function areServicesDisabled() {
  const args = Array.from(process.argv);
  return args.includes('--disable-services');
}

// Immediately invoked function: main()
(async function main() {
  try {
    if (!areServicesDisabled()) {
      await initServices();
    }

    await initWebServer();
  } catch (ex) {
    console.trace(ex);
    cleanup();
  }
}());
