/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var Apply  = require(__dirname + '/common/apply.js');
var Concat = require('shark').extend.concat;
var http = require('http').createServer(function (req, res) {

  /**
   * @remote ip address
   */
  var  _addr = 'unknown';
  if (req.connection && req.connection.remoteAddress) {
    _addr = req.connection.remoteAddress;
  }

  if ('127.0.0.1' === _addr && req.headers['x-real-ip']) {
    _addr = req.headers['x-real-ip'];
  }

  var _info = {};
  for (var i in req.headers) {
    if (i.indexOf('x-app-') === 0) {
      _info[i.slice(6)] = req.headers[i].trim().toLowerCase();
    }
  }

  _info.ipaddr = _addr;

  var idata = Concat();
  req.on('data', function (data) {
    idata.push(data);
  });

  req.on('end', function () {
    Apply.create(res, req.url, idata.all(), _info).execute({
      'root' : __dirname + '/rest',
    });
  });
});

require('pm').createWorker().ready(function (socket) {
  http.emit('connection', socket);
});

