/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var Shark   = require('shark');
var Util    = require('util');
var Crypto  = require('crypto');
var iError  = require(__dirname + '/../common/ierror.js');

var _escape = Shark.extend.escape;
var _signat = function (a) {
  return Crypto.createHash('md5').update(a.join('')).digest('hex');
};

/**
 * @ 更新session
 */
var _stouch = function (path, req, callback) {

  var sid = _signat([req.info.uuid, path]);
  var key = _escape(path.split('').reverse().join('')); /**<    to use mysql index  */
  var now = parseInt(Date.now() / 1000, 10);
  var sql = [
    'INSERT INTO client_session (addtime, modtime, sessid, ipaddr, clientid, nodepath, sessdata)',
    Util.format(
        "VALUES (%d, %d, '%s', '%s', '%s', '%s', '%s') ON DUPLICATE KEY UPDATE", 
        now, now, sid, _escape(req.info.ipaddr), _escape(req.info.uuid), key, _escape(req.data || '')),
    Util.format(
        "modtime = %d, ipaddr = '%s', clientid = '%s', nodepath = '%s', sessdata='%s'", 
        now, _escape(req.info.ipaddr), _escape(req.info.uuid), key, _escape(req.data || ''))
      ];

  Shark.factory.getMysql('default').query(sql.join(' '), callback);
};

var _getstorage = function () {
  return Shark.factory.getObject('#zookeeper/default');
};

/* {{{ function _getwatcher() */
/**
 * @ 监视器列表
 */
var __watchdogs = {};
var _getwatcher = function (url) {
  if (!__watchdogs[url]) {
    __watchdogs[url] = require(__dirname + '/../common/watcher.js').create();
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
    return callback(iError.create('AccessDenied', 'Action "set" is not allowed from ' + req.info.addr));
  }
  _getstorage().set(req.url.shift(), req.data, function (error) {
    callback(error, '');
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

/* {{{ action watch() */
API.watch = function (req, callback) {
  var u = req.url.shift();
  var w = _getwatcher(u);

  if ((100 * Math.random()) <= (req.info.touchratio || 10)) {
    _stouch(u, req, function (error, res) {
      error && Shark.logException(error);
    });
  }

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
  }, req.info.tmout || 59000);

  _getstorage().watch(u, req.info.interval || 3000, function (curr, prev) {
    w.emit(curr);
  });

};
/* }}} */

exports.execute = function (req, callback) {
  var a = (req.url.shift() || 'index').toLowerCase();
  if (!API[a] || 'function' !== (typeof API[a])) {
    return callback(iError.create('ActionNotFound', Util.format('Action "%s" not found.', a)));
  }

  /**
   * @ TODO: Add auth validate here
   */

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

