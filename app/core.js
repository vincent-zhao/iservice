/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var Apply = require(__dirname + '/common/apply.js');
var http = require('http').createServer(function (req, res) {

  var chunks = [];
  var length = 0;
  req.on('data', function (data) {
    chunks.push(data);
    length += data.length;
  });
  req.on('end', function () {
    switch (chunks.length) {
      case 0:
        break;

      case 1:
        break;

      default:
        break;
    }
    Apply.create(res, req.url, new Buffer('aa')).execute({
      'root' : __dirname + '/rest',
    });
  });
});

require('pm').createWorker().ready(function (socket) {
  http.emit('connection', socket);
});

