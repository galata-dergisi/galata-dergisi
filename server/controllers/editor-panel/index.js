// Copyright 2022 Mehmet Baker
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

const staticRouter = require('./staticRouter.js');

class EditorPanelController {
  constructor(params) {
    this.databasePool = params.databasePool;
    this.router = new Router();
    this.addRoutes();
  }

  addRoutes() {
    this.router.use((req, res, next) => {
      console.info(`${new Date().toISOString()}:`, req.url);
      next();
    });

    this.router.use('/editor-panel', staticRouter());
  }

  getRouter() {
    return this.router;
  }
}

module.exports = EditorPanelController;
