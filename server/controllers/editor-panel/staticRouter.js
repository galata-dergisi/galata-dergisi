const path = require('path');
const express = require('express');

module.exports = function staticRouter() {
  return express.static(path.join(__dirname, '../../../editor-panel'));
}
