/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var storage = require(__dirname + '/common/storage.js');
var watcher = require(__dirname + '/common/watcher.js');

/**
 * @监听列表
 *
 * key => [ response1, response2, ... ]
 */
var __rest_watchers = {};

var http = require('http').createServer(function (req, res) {

  req.on('data', function (chunk) {
  });

  req.on('end', function () {
  });

  var urls  = [];
  req.url.split('?').shift().split('/').forEach(function (item) {
    if ('' !== item) {
      urls.push(item.trim().toLowerCase());
    }
  });

  switch (urls.shift()) {

    case 'watch':
      var idx = urls.join('/') || '/';
      if (!__rest_watchers[idx]) {
        __rest_watchers[idx] = [];
      }

      var key = __rest_watchers[idx].push(res);
      req.on('close', function () {
        // XXX:
      });

      break;

    case 'set':
      var idx = urls.join('/') || '/';
      if (__rest_watchers[idx]) {
        __rest_watchers[idx].forEach(function (res) {
          res.end(idx + ' changed');
        });
      };
      res.end('OK');
      break;

    default:
      res.end('hello world');
      break;
  
  }
});

require('pm').createWorker().ready(function (socket) {
  http.emit('connection', socket);
});
