/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var Emitter = require('events').EventEmitter;
var iError  = require(__dirname + '/ierror.js');
var Util = require('util');
var Zookeeper = require('zookeeper');

var normalize = function (key) {
  return key.replace(/\/{2,}/g, '/').trim();
};

exports.create  = function (options) {

  /**
   * @ options
   */
  /* {{{ */
  var _options  = {
    'hosts' : 'localhost:2181',
    'root'  : '/',
    'user'  : '',
    'pass'  : '',
    'readonly'  : true
  };
  for (var i in options) {
    _options[i] = options[i];
  }
  /* }}} */

  /**
   * @ oprate queue 
   */
  var _queues = [];

  /**
   * @ zk handle
   */
  var _handle = null;

  /* {{{ connect to zookeeper */

  var _conn = {
    'connect' : normalize(Util.format('%s/%s', _options.hosts, _options.root)),
    'timeout' : 300000,
    'debug_level' : Zookeeper.ZOO_LOG_LEVEL_WARN,
    'host_order_deterministic' : false
  };
  (new Zookeeper()).connect(_conn, function (error, zk) {
    if (error) {
      throw error;
    }

    _handle = zk;
    _handle.setEncoding('utf-8');
    while (_queues.length) {
      (_queues.shift())();
    }
  });
  /* }}} */

  var Storage   = function () {
    if (!(this instanceof Storage)) {
      return new Storage();
    }
    Emitter.call(this);
  };
  Util.inherits(Storage, Emitter);

  Storage.prototype.get = function (key, callback) {
    var _self = this;
    if (!_handle) {
      return _queues.push(function () {
        _self.get(key, callback);
      });
    }
    _handle.a_get(normalize(key), false, function (code, error, stat, data) {
      if (Zookeeper.ZOK !== code) {
        error = null;
      } else if (Zookeeper.ZNONODE === code) {
        error = iError.create('NotFound', error);
      } else {
        error = iError.create('ZookeeperError', error);
      }
      callback(error, data);
    });
  };

  Storage.prototype.set = function (key, data, callback) {
    var _self = this;
    if (!_handle) {
      return _queues.push(function () {
        _self.set(key, data, callback);
      });
    }
  };

  Storage.prototype.watch = function (key) {
  };

  return new Storage();
};

