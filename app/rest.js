/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var Shark   = require('shark');

var Factory = Shark.factory;
Factory.cleanAll();

/**
 * @ global config object
 */
var config  = Shark.config.create(__dirname + '/../etc/rest.ini');
Factory.setConfig('rest', config);

var _confs  = config.find('mysql');
for (var i in _confs) {
  Factory.setMysql(i, _confs[i]);
}

var _confs  = config.find('log');
for (var i in _confs) {
  Factory.setLog(i, _confs[i]);
}

Shark.setExceptionLogger(config.get('log:error'));
process.on('uncaughtException', function (e) {
  Shark.log.exception(e);
  process.exit(1);
});

var server  = require(__dirname + '/common/server.js').create({
  'header_prefix' : 'x-app-',
  'control_root'  : __dirname + '/rest'
});

var events  = Shark.events.create(function (error) {

  if (error) {
    throw error;
  }

  require('pm').createWorker().ready(function (socket) {
    server.emit('connection', socket);
  });
});

events.wait('ok', function () {
  events.emit('ok');
});

