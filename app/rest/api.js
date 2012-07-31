/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var Util    = require('util');
var iError  = require(__dirname + '/../common/ierror.js');

/* {{{ function _getstorage() */
/**
 * @ 存储器列表
 */
var __storages  = {};
var _getstorage = function () {
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
API.index   = function (req, callback) {
  callback(null, '<!--STATUS OK-->');
};

/* {{{ action get() */
API.get = function (req, callback) {
  _getstorage().get(req.url.shift(), function (error, data) {
    callback(error, data);
  });
};
/* }}} */

/* {{{ action set() */
API.set = function (req, callback) {
  if ('127.0.0.1' !== req.info.addr) {
    callback(iError.create('AccessDenied', 'Action "set" is not allowed from ' + req.info.addr));
  } else {
    _getstorage().set(req.url.shift(), req.data, function (error) {
      callback(error, '');
    });
  }
};
/* }}} */

/* {{{ action watch() */
API.watch = function (req, callback) {
  var u = req.url.shift();
  var w = _getwatcher(u);

  var i = w.push(function (data) {
    callback(null, data);
    if (t) {
      clearTimeout(t);
      t = null;
    }
  });

  var t = setTimeout(function () {
    w.remove(i);
    callback(null, null);
  }, req.info.timeout || 300000);

  _getstorage().watch(u, req.info.interval || 3000, function (curr, prev) {
    w.emit(curr);
  });

};
/* }}} */

/* {{{ action tree() */
API.tree = function (req, callback) {
  _getstorage().tree(req.url.shift(), function (error, data) {
    callback(error, data);
  });
};
/* }}} */

/* {{{ action feedback() */
API.feedback = function (req, callback) {
};
/* }}} */

exports.execute = function (req, callback) {
  var a = (req.url.shift() || 'index').toLowerCase();
  if (!API[a] || 'function' !== (typeof API[a])) {
    return callback(iError.create('ActionNotFound', Util.format('Action "%s" not found.', a)));
  }
  (API[a])(req, function (error, data) {
    callback(null, JSON.stringify({
      'error'   : error,
      'data'    : data,
    }));
  });
};

