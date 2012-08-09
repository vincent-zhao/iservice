/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var Factory = require('shark').factory;
Factory.cleanAll();

/**
 * @ global config object
 */
var config  = require('shark').config.create(__dirname + '/../etc/rest.ini');
Factory.setConfig('rest', config);

['mysql', 'log', 'zookeeper'].forEach(function (type) {
  var o = config.find(type);
  var p = '#' + type + '/';
  for (var i in o) {
    Factory.setObject(p + i, o[i]);
  }
});

var server  = require(__dirname + '/common/server.js').create({
  'header_prefix' : 'x-app-',
  'control_root'  : __dirname + '/rest'
});

require('pm').createWorker().ready(function (socket) {
  server.emit('connection', socket);
});

process.on('uncaughtException', function (e) {
  Factory.getLog('error').exception(e);
  process.exit(0);
});
