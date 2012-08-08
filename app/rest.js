/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var http = require(__dirname + '/common/server.js').create({
  'header_prefix'   : 'x-app-',
    'control_root'  : __dirname + '/rest'
});

require('pm').createWorker().ready(function (socket) {
  http.emit('connection', socket);
});

