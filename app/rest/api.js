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

/**
 * @ action列表
 */
var Actions = {};
Actions.get = function (url, callback) {
};

exports.execute = function (req, callback) {

  var action = req.url.shift().toLowerCase();
  var prefix = req.url.shift();

  callback(null, prefix);
};

