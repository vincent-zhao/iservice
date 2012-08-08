/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var Apply   = require(__dirname + '/apply.js');
var Concat  = require('shark').extend.concat;
var Http    = require('http');

exports.create = function (options) {

  /**
   * @ 配置参数
   */
  var _options  = {
    'header_prefix' : 'x-app-',
    'control_root'  : __dirname + '/../control',
  };
  for (var i in options) {
    _options[i] = options[i];
  }

  return Http.createServer(function (req, res) {

    /**
     * @ 控制信息
     */
    var _info = {};
    var _offs = _options.header_prefix.length;
    for (var i in req.headers) {
      if (_offs && i.indexOf(_options.header_prefix) === 0) {
        _info[i.slice(_offs)] = req.headers[i].trim().toLowerCase();
      }
    }

    _info.ipaddr = 'unknown';
    if (req.connection && req.connection.remoteAddress) {
      _info.ipaddr = req.connection.remoteAddress;
    }

    if ('127.0.0.1' === _info.ipaddr && req.headers['x-real-ip']) {
      _info.ipaddr = req.headers['x-real-ip'];
    }

    var idata = Concat();
    req.on('data', function (data) {
      idata.push(data);
    });

    req.on('end', function () {
      Apply.create(res, req.url, idata.all(), _info).execute({
        'root' : _options.control_root,
      });
    });
  });

};
