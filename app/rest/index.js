/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var http = require('http').createServer(function (req, res) {
  res.end('hello world');
});

require('pm').createWorker().ready(function (socket) {
  http.emit('connection', socket);
});
