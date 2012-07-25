/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

/* {{{ function _getstorage() */
/**
 * @ 存储器列表
 */
var __storages  = {};
var _getstorage = function (url) {
  var idx = '';
  if (!__storages[idx]) {
    __storages[idx] = require(__dirname + '/../common/storage.js').create(
        // XXX: options
        );
  }

  return __storages[idx];
};
/* }}} */

/* {{{ function _getwatcher() */
/**
 * @ 监视器列表
 */
var __watchdogs = {};
var _getwatcher = function (url) {
  if (!__watchdogs[url]) {
    __watchdogs[url] = require(__dirname + '/../common/watcher.js').create(
        /**<    delay, recall   */
        );
  }

  return __watchdogs[url];
};
/* }}} */

/**
 * @ action列表
 */
var ACTIONS = {};
ACTIONS.get = function (url, callback) {
};

exports.execute = function (req, callback) {

  var a = (req.url.shift() || 'status').toLowerCase();
  console.log(a);
  var u = req.url.shift();

  callback(null, u);
};

