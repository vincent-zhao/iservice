/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

/**
 * @监听列表
 *
 * key => [ response1, response2, ... ]
 */
var __rest_watchers = {};

var http = require('http').createServer(function (req, res) {
  console.log(req.url);
  res.end('hello world');
});

require('pm').createWorker().ready(function (socket) {
  http.emit('connection', socket);
});
