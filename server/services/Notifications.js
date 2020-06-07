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

const nodemailer = require('nodemailer');
const Utils = require('../lib/Utils.js');

// 1 minute
const INTERVAL = 60 * 1000;

class Notifications {
  constructor(params) {
    this.databasePool = params.databasePool;
  }

  static init(params) {
    const notifications = new Notifications(params);
    notifications.start();
  }

  start() {
    this.loop();
  }

  /**
   * Adds a notification to the queue in the database.
   * @param {object} conn MariaDB database connection instance
   * @param {object} notification Notification as an object
   * @param {string} notification.recipient Recipient address (email)
   * @param {string} notification.subject Subject of the notification email
   * @param {message} notification.message HTML body of the email
   * @returns {Promise.<object>} Query result
   */
  static async addNotification(conn, notification) {
    const result = await conn.query('INSERT INTO notification_queue (recipient, subject, message) VALUES (?, ?, ?)', [
      notification.recipient,
      notification.subject,
      notification.message,
    ]);

    return result;
  }

  static async getAssetTypes(conn) {
    const ASSET_TYPES = {};
    const rows = await conn.query('SELECT * FROM asset_types');

    for (const row of rows) {
      ASSET_TYPES[row.type] = row.name;
    }

    return ASSET_TYPES;
  }

  /**
   * Adds an asset notification to the queue
   * @param {object} conn MariaDB database connection instance
   * @param {string} recipient Recipient email
   * @param {object} data Contribution
   * @param {string} data.contributor Contributor's name
   * @param {string} data.contributorEmail Contributor's email
   * @param {string} data.title Asset title
   * @param {string} data.type Asset type
   * @param {string} [data.video=null] Video link
   * @param {string} data.message Additional message from contributor
   * @param {string} [data.driveLink] Google Drive link of the asset
   * @returns {Promise.<object>} Query result
   */
  static async addContributionNotification(conn, recipient, data) {
    const ASSET_TYPES = await Notifications.getAssetTypes(conn);

    let messageBody = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Bildirim</title>

        <style>
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
          }

          body {
            background: #222;
            color: #ddd;
          }

          a, a:visited, a:active {
            color: #ddd;
            transition: color .1s ease;
          }

          a:hover {
            color: #4a9957;
          }
        </style>
      <head>

      <body>
      <h1 style="text-align: center">Galata Dergisi'ne Yeni bir Katkı Yapıldı</h1>

      <table>
      <tr>
        <td>Katkıda Bulunan</td>
        <td>:</td>
        <td>${data.contributor}</td>
      </tr>

      <tr>
        <td>Eposta Adresi</td>
        <td>:</td>
        <td><a href="mailto:${data.contributorEmail}">${data.contributorEmail}</a></td>
      </tr>

      <tr>
        <td>Başlık</td>
        <td>:</td>
        <td>${data.title}</td>
      </tr>

      <tr>
        <td>Tür</td>
        <td>:</td>
        <td>${ASSET_TYPES[data.type] || data.type}</td>
      </tr>
    `;

    if (data.type === 'video') {
      messageBody += `
        <tr>
          <td>Video</td>
          <td>:</td>
          <td><a href="${data.video}" target="_blank">${data.video}</a></td>
        </tr>
      `;
    }

    if (data.driveLink) {
      messageBody += `
        <tr>
          <td>Önizleme Bağlantısı</td>
          <td>:</td>
          <td><a href="${data.driveLink}" target="_blank">${data.driveLink}</a></td>
        </tr>
      `;
    }

    messageBody += `
      <tr>
        <td>Mesaj</td>
        <td>:</td>
        <td>${data.message}</td>
      </tr>
      </table>
      <br /><br />
      <em>Bu mesaj otomatik olarak üretilmiştir. Galata'nın botu tüm editörlerimize iyi çalışmalar diler :)</em>
      </body>
      </html>
    `;

    return Notifications.addNotification(
      conn,
      {
        recipient,
        subject: `Yeni Katkı: ${data.title} - ${data.contributor}`,
        message: messageBody,
      },
    );
  }

  /**
   * Adds an error notification to the queue
   * @param {object} conn MariaDB database connection instance
   * @param {string} recipient Recipient email
   * @param {object} data Contribution
   * @param {string} data.title Title of message
   * @param {Error} data.error Error instance
   * @param {string} [data.message=-] A detailed description of what went wrong.
   * @returns {Promise.<object>} Query result
   */
  static async addErrorNotification(conn, recipient, data) {
    const messageBody = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1">

          <title>Error Notification</title>

          <style>
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
            }

            body {
              background: #222;
              color: #ddd;
            }

            td:last-child {
              padding: 13px;
            }
          </style>
        </head>

        <body>
          <h1>An Error Occurred</h1>

          <table>
            <tr>
              <td>Time</td>
              <td>:</td>
              <td>${new Date().toISOString()}</td>
            </tr>

            <tr>
              <td>Error</td>
              <td>:</td>
              <td>${data.title}</td>
            </tr>

            <tr>
              <td>Error Message</td>
              <td>:</td>
              <td>${data.error.message}</td>
            </tr>

            <tr>
              <td>Error Code</td>
              <td>:</td>
              <td>${data.error.code || '-'}</td>
            </tr>

            <tr>
              <td>Error Stack</td>
              <td>:</td>
              <td>${data.error.stack.replace(/\n/g, '<br />&nbsp;&nbsp;&nbsp;&nbsp;')}</td>
            </tr>

            <tr>
              <td>Additional Information</td>
              <td>:</td>
              <td>${data.message || '-'}</td>
            </tr>
          </table>
        </body>
      </html>
    `;

    return Notifications.addNotification(conn, {
      recipient,
      subject: `An Error Occurred: ${data.title}`,
      message: messageBody,
    });
  }

  async getQueueItems() {
    let conn;

    try {
      conn = await this.databasePool.getConnection();

      console.log('Checking notification queue...');
      const rows = await conn.query('SELECT * FROM notification_queue');
      console.log(Utils.constructEnglishCountingSentence(rows.length, 'notification'));

      return rows;
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }

  static getSmtpTransporter(settings) {
    return nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpSecure,
      auth: {
        user: settings.smtpUsername,
        pass: settings.smtpPassword,
      },
    });
  }

  static getSmtpMessage(queueItem, settings) {
    return {
      from: settings.assetSender,
      to: settings.assetRecipient,
      subject: queueItem.subject,
      html: queueItem.message,
      dsn: {
        id: queueItem.id,
        notify: ['failure', 'delay'],
        recipient: settings.adminRecipient,
        return: 'headers',
      },
    };
  }

  async removeQueueItemFromDatabase(id) {
    let conn;

    try {
      conn = await this.databasePool.getConnection();
      const result = await conn.query('DELETE FROM notification_queue WHERE id = ?', [id]);

      if (result.affectedRows !== 1) {
        console.warn(`Failed to remove queue item #${id}: Item doesn't exist.`);
      }

      console.log(`Queue Item #${id} is removed.`);
    } catch (ex) {
      console.error('Failed to remove entry from database.');
      console.trace(ex);
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }

  async sendEmail(queueItem) {
    let conn;

    try {
      conn = await this.databasePool.getConnection();
      const settings = await Utils.getSettings(conn);

      const transporter = Notifications.getSmtpTransporter(settings);
      const message = Notifications.getSmtpMessage(queueItem, settings);

      console.log(`Queue Item #${queueItem.id}: Sending email "${queueItem.subject}" to <${queueItem.recipient}>...`);
      await transporter.sendMail(message);

      console.log(`Email is sent. Removing queue item #${queueItem.id}...`);
      await this.removeQueueItemFromDatabase(queueItem.id);
    } catch (ex) {
      console.warn(`Failed to send email. Queue Item Id: ${queueItem.id}. Will retry in the next loop.`);
      console.trace(ex);
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }

  async loop() {
    try {
      const queueItems = await this.getQueueItems();

      for (const queueItem of queueItems) {
        await this.sendEmail(queueItem);
      }
    } catch (ex) {
      console.trace(ex);
    } finally {
      setTimeout(() => this.loop(), INTERVAL);
    }
  }
}

module.exports = Notifications;
