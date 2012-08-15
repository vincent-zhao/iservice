/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var Util = require('util');
var Url  = require(__dirname + '/url.js');

exports.create = function (res, url, data, info) {

  var _me   = {
    'time'  : Date.now(),
    'url'   : Url.create(url),
    'data'  : (data || '').toString(),
    'info'  : info || {},
  };

  var _done = false;

  var _ERRORLOG = function (error) {
    require('shark').log.exception(error, {
      'URL' : url,
      'POST': data,
    });
  };

  /* {{{ public function finish() */
  _me.finish = function (data, info, code) {
    if (_done) {
      return;
    }

    var header = {};
    for (var i in info) {
      header['x-app-' + i] = info[i];
    }

    res.writeHead(code ? parseInt(code, 10) : 200, header);
    res.end(data.toString());
    _done = true;
  };
  /* }}} */

  /* {{{ public function execute() */
  _me.execute = function (config) {
    var control = Util.format('%s/%s.js',
        (config && config.root) || __dirname + '/../control', _me.url.shift() || 'index');
    try {
      require(control).execute(_me, function (error, data, info, code) {
        _me.finish(data || error, info, code || 200);
        if (error) {
          _ERRORLOG(e);
        }
      });
    } catch (e) {
      _me.finish('', {}, 404);
      _ERRORLOG(e);
    }
  };
  /* }}} */

  return _me;
};

