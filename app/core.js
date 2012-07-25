/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var Apply = require(__dirname + '/common/apply.js');
var http = require('http').createServer(function (req, res) {
  req.on('data', function (data) {
  });
  req.on('end', function () {
    Apply.create(res, req.url, new Buffer('aa')).execute({
      'root' : __dirname + '/rest',
    });
  });
});

require('pm').createWorker().ready(function (socket) {
  http.emit('connection', socket);
});

