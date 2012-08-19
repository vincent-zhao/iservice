/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var Shark   = require('shark');
var Util    = require('util');
var iError  = require(__dirname + '/../common/ierror.js');

var _getstorage = function () {
  return Shark.factory.getObject('#zookeeper/default');
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
  }, req.info.tmout || 60000);

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
  var t = parseInt(Date.now() / 1000, 10);
  var s = Util.format(
      "INSERT INTO client_session (addtime, modtime, sessid, ipaddr, remoteid, nodepath, sessdata) " +
      "VALUES (%d, %d, '%s', '%s', '%s', '%s', '%s', '%s') ON DUPLICATE KEY " +
      "UPDATE modtime = %d, ipaddr='%s', remoteid = '%s', nodepath='%s', sessdata='%s'",
      t, t, 'id', req.info.ipaddr, 'remoteid', 'path', 'data', 
      t, req.info.ipaddr, 'remoteid', 'path', 'data');
console.log(s);

return callback(null);
  Shark.factory.getMysql('default').query(s, function (error, res) {
    callback(error, res);
  });
};
/* }}} */

exports.execute = function (req, callback) {
  var a = (req.url.shift() || 'index').toLowerCase();
  if (!API[a] || 'function' !== (typeof API[a])) {
    return callback(iError.create('ActionNotFound', Util.format('Action "%s" not found.', a)));
  }
  (API[a])(req, function (error, data) {
    if (error) {
      Shark.logException(error, req);
    }
    callback(null, JSON.stringify({
      'error'   : error,
      'data'    : data,
    }));
  });
};

