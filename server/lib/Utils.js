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

class Utils {
  /**
   * Constructs this sentence: There is/are ${count} ${itemName}(s).
   * @param {number} count Number of items 
   * @param {string} itemName Name of items
   * @returns {string}
   */
  static constructEnglishCountingSentence(count, itemName) {
    return `There ${count === 1 ? 'is' : 'are'} ${count === 0 ? 'no' : count} ${itemName}${count === 1 ? '' : 's'}.`;
  }

  /**
   * Retrieves settings from database.
   * @param {object} conn MariaDB connection instance
   * @returns {object} First row of the settings table
   */
  static async getSettings(conn) {
    const rows = await conn.query('SELECT * FROM settings');

    if (rows.length !== 1) {
      throw new Error('Settings table is in invalid state!');
    }

    const [settings] = rows;
    settings.smtpSecure = Buffer.from(settings.smtpSecure)[0] === 1;

    return settings;
  }
}

module.exports = Utils;
