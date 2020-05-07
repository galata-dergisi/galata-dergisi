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
const { google } = require('googleapis');

const fsPromises = fs.promises;

// 1 minute
const SYNC_INTERVAL = 60 * 1000;

class GDriveSync {
  constructor(params) {
    this.databasePool = params.databasePool;
    this.uploadsDir = params.uploadsDir;
  }

  static init(params) {
    const gdriveSync = new GDriveSync(params);
    gdriveSync.start();
  }

  async start() {
    try {
      await this.getSettings();
      this.initOAuthClient();
      this.initDrive();
      this.syncLoop();
    } catch (ex) {
      console.trace(ex);
      console.error('Failed to initialize Google Drive Sync.');
      process.exit(13);
    }
  }

  async getSettings() {
    let conn;

    try {
      conn = await this.databasePool.getConnection();
      const rows = await conn.query('SELECT * FROM settings LIMIT 1');

      if (rows.length !== 1) {
        throw new Error('Settings table is misconfigured!');
      }

      [this.settings] = rows;
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }

  initOAuthClient() {
    const {
      driveClientId, driveClientSecret, driveRedirectURI, driveRefreshToken,
    } = this.settings;
    this.oAuth2Client = new google.auth.OAuth2(driveClientId, driveClientSecret, driveRedirectURI);
    this.oAuth2Client.setCredentials({ refresh_token: driveRefreshToken });

    // Add a listener for refresh tokens
    this.oAuth2Client.on('tokens', async (tokens) => {
      if (tokens.refresh_token) {
        console.info('Received new refresh token');
        this.saveRefreshToken(tokens.refresh_token);
      }
    });
  }

  async saveRefreshToken(refreshToken) {
    let conn;

    try {
      conn = await this.databasePool.getConnection();
      const result = await conn.query('UPDATE settings SET driveRefreshToken = ?', [refreshToken]);

      if (result.affectedRows !== 1) {
        console.warn('Falied to save refresh token in the database!');
        return;
      }

      console.info('Refresh token has been saved.');
    } catch (ex) {
      console.trace(ex);
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }

  initDrive() {
    this.drive = google.drive({
      version: 'v3',
      auth: this.oAuth2Client,
    });
  }

  async getAssets() {
    let conn;

    try {
      conn = await this.databasePool.getConnection();

      console.log('Querying database for new assets...');
      const rows = await conn.query('SELECT * FROM assets WHERE isUploaded = 0 AND fileName IS NOT NULL');
      return rows;
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }

  async fileExists(asset) {
    try {
      const stat = await fsPromises.stat(path.join(this.uploadsDir, asset.filename));

      if (stat.isFile()) {
        return true;
      }

      console.warn(`${asset.filename} is not a file!`);
    } catch (ex) {
      if (ex.code === 'ENOENT') {
        // This is something we should tell to the admin
        console.error("File doesn't exist.");
        return false;
      }

      console.trace(ex);
    }

    return false;
  }

  async uploadAsset(asset) {
    try {
      console.log(`Uploading asset #${asset.id}: ${asset.filename}`);

      const fileName = `${asset.title} - ${asset.contributor}${path.extname(asset.filename)}`;

      const res = await this.drive.files.create({
        fields: 'id, webViewLink',
        requestBody: {
          name: fileName,
          parents: [this.settings.driveFolderId],
          properties: {
            assetId: asset.id,
            contributor: asset.contributor,
            contributorEmail: asset.contributorEmail,
            title: asset.title,
            type: asset.type,
            video: asset.video,
            filename: asset.filename,
          },
        },
        media: {
          body: fs.createReadStream(path.join(this.uploadsDir, asset.filename)),
        },
      });

      console.log(`Asset #${asset.id} is uploaded.`);
      console.log('--------------------------------------------');
      console.log('File ID  : ', res.data.id);
      console.log('Asset ID : ', asset.id);
      console.log('File Name: ', fileName);
      console.log('Web Link : ', res.data.webViewLink);
      console.log('--------------------------------------------');
      await this.saveDriveData(asset.id, res.data);
    } catch (ex) {
      // console.log(ex.message, ex.code, ex.response.data.error_description);
      console.trace(ex);
    }
  }

  async saveDriveData(assetId, driveData) {
    let conn;

    try {
      conn = await this.databasePool.getConnection();

      const updateResult = await conn.query('UPDATE assets SET driveId = ?, isUploaded = 1, driveLink = ? WHERE id = ?', [
        driveData.id,
        driveData.webViewLink,
        assetId,
      ]);

      if (updateResult.affectedRows !== 1) {
        throw new Error(`Failed to update asset #${assetId}'s entry in database.`);
      }

      console.log(`Asset #${assetId}'s file id has been saved to database.`);
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }

  async syncLoop() {
    try {
      const assets = await this.getAssets();

      for (const asset of assets) {
        if (await this.fileExists(asset)) {
          await this.uploadAsset(asset);
        }
      }
    } catch (ex) {
      console.trace(ex);
    } finally {
      setTimeout(() => this.syncLoop(), SYNC_INTERVAL);
    }
  }
}

module.exports = GDriveSync;
