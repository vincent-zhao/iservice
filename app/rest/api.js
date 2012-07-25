/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var Util    = require('util');
var iError  = require(__dirname + '/../common/ierror.js');

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
var API = {};
API.get = function (url, callback) {
  _getstorage(url).get(url, function (error, data) {
    callback(error, data);
  });
};

API.watch = function (url, callback) {
  var w = _getwatcher(url);
  _getstorage(url).watch(url, 2000, function (curr, prev) {
    w.emit(curr);
  });

  w.push(function (data) {
    callback(null, data);
  });
};

API.status = function (url, callback) {
  callback(null, '<!--STATUS OK-->');
};

exports.execute = function (req, callback) {

  var a = (req.url.shift() || 'status').toLowerCase();
  var u = req.url.shift();

  if (!API[a] || 'function' !== (typeof API[a])) {
    return callback(iError.create('NotFound', Util.format('Action "%s" not found.', a)));
  }

  (API[a])(u, callback);
};

