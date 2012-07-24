/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var Emitter = require('events').EventEmitter;
var iError  = require(__dirname + '/ierror.js');
var Util = require('util');
var Zookeeper = require('zookeeper');

var normalize = function (key) {
  return key.replace(/\/{2,}/g, '/').trim();
};

/* {{{ function getAllNodes() */

var getAllNodes = function (zk, root, callback) {
  var _list = [];
  var _dump = function (key, cb) {
    var num = 0;
    zk.a_get_children(key, false, function (code, error, children) {
      if (Zookeeper.ZOK !== code && Zookeeper.ZNONODE !== code) {
        return cb(iError.create('ZookeeperError', error));
      }

      if (!children || !children.length) {
        return cb(null);
      }

      num += children.length;
      error = null;

      children.forEach(function (sub) {
        sub = normalize(root + '/' + sub);
        _list.push(sub);
        _dump(sub, function (err) {
          error = error || err;
          if ((--num) === 0) {
            cb(error);
          }
        });
      });
    });
  };
  _dump(normalize('/' + root), function (error) {
    callback(error, _list.sort(function (a, b) {
      return b.split('/').length - a.split('/').length;
    }));
  });
};
/* }}} */

/* }}} */

exports.create  = function (options) {

  /**
   * @ options
   */
  /* {{{ */
  var _options  = {
    'hosts' : 'localhost:2181',
    'root'  : '/',
    'user'  : '',
    'pass'  : ''
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
      throw iError.create('ConnectError', error);
    }

    _handle = zk;
    _handle.setEncoding('utf-8');
    while (_queues.length) {
      (_queues.shift())();
    }
  });
  /* }}} */

  var Storage   = function () {
    Emitter.call(this);
  };
  Util.inherits(Storage, Emitter);

  /* {{{ public prototype get() */
  /**
   * Get value from storage by key
   *
   * @access public
   * @param {String} key
   * @param {Function} callback
   */
  Storage.prototype.get = function (key, callback) {
    var _self = this;
    if (!_handle) {
      return _queues.push(function () {
        _self.get(key, callback);
      });
    }
    _handle.a_get(normalize('/' + key), false, function (code, error, stat, data) {
      if (Zookeeper.ZOK === code) {
        error = null;
      } else {
        error = iError.create(Zookeeper.ZNONODE === code ? 'NotFound' : 'ZookeeperError', error);
      }
      callback && callback(error, data);
    });
  };
  /* }}} */

  /* {{{ public prototype set() */
  /**
   * Set value into storage by key
   *
   * @access public
   * @param {String} key
   * @param {String} data
   * @param {Function} callback
   */
  Storage.prototype.set = function (key, data, callback) {
    var _self = this;
    if (!_handle) {
      return _queues.push(function () {
        _self.set(key, data, callback);
      });
    }

    key = normalize('/' + key);
    _handle.a_set(key, data, -1, function (code, error) {
      if (Zookeeper.ZNONODE !== code) {
        return callback((Zookeeper.ZOK === code) ? null : iError.create('UpdateError', error));
      }

      _handle.a_create(key, data, 0, function (code, error) {
        if (Zookeeper.ZNONODE !== code) {
          return callback((Zookeeper.ZOK === code) ? null : iError.create('CreateError', error));
        }

        _handle.mkdirp(key, function (error) {
          if (error) {
            callback(iError.create('CreateError', error));
          } else {
            _self.set(key, data, callback);
          }
        });
      });
    });
  };
  /* }}} */

  /* {{{ public prototype watch() */
  /**
   * Watch change event for a node by key
   *
   * @access public
   * @param {String} key
   * @param {Function} callback
   */
  var _watchers = {};
  Storage.prototype.watch = function (key, interval, callback) {
    var _self = this;
    if (!_handle) {
      return _queues.push(function () {
        _self.watch(key, interval, callback);
      });
    }

    key = normalize('/' + key);
    var _check = function (next) {
      _handle.a_get(key, false, function (code, error, stat, data) {
        if (data && data !== _watchers[key]) {
          if (!_watchers[key]) {
            _watch();
          }
          callback(data, _watchers[key]);
        }

        if (Zookeeper.ZOK === code) {
          _watchers[key] = data;
        }

        next && next();
      });
    };

    var _watch = function () {
      _handle.aw_get(key, function (type, stat, path) {
        _watch();
        _check();
      }, function () {});
    };

    _watch();
    (function _loops(time) {
      setTimeout(function () {
        _check(function () {
          _loops(interval || 60000);
        });
      }, time);
    })(1 + Math.random() * (interval || 60000));
  };
  /* }}} */

  /* {{{ public prototype remove() */
  /**
   * remove nodes by key
   */
  Storage.prototype.remove = function (key, callback) {
    var _self = this;
    if (!_handle) {
      return _queues.push(function () {
        _self.remove(key, callback);
      });
    }

    getAllNodes(_handle, key, function (error, nodes) {
      if (!nodes || !nodes.length) {
        return callback(error, []);
      }

      var num = nodes.length;
      nodes.forEach(function (path) {
        _handle.a_delete_(path, -1, function (code, errmsg) {
          if ((--num) === 0) {
            callback(nodes);
          }
        });
      });
    });
  };
  /* }}} */

  return new Storage();

};

