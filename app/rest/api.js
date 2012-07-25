/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var watcher = require(__dirname + '/../common/watcher.js');
var storage = require(__dirname + '/../common/storage.js');

/**
 * XXX: create storage
 */

/**
 * @ 监视器列表
 */
var __watchdogs = {};
exports.execute = function (req, callback) {

  switch (req.url.shift().toLowerCase()) {

    case 'get':
      break;

    case 'watch':
      break;

    default:
      break;
  }

};

