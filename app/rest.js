/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var Shark   = require('shark');
var Storage = require(__dirname + '/common/storage.js');

var Factory = Shark.factory;
Factory.cleanAll();

/**
 * @ global config object
 */
var config  = Shark.config.create(__dirname + '/../etc/rest.ini');
Factory.setConfig('rest', config);

Shark.setExceptionLogger(config.get('log:error'));
process.on('uncaughtException', function (e) {
  console.log(e.stack);
  Shark.logException(e);
  process.exit(1);
});

/**
 * @ global mysql objects
 */
var _confs  = config.find('mysql');
for (var i in _confs) {
  Factory.setMysql(i, _confs[i]);
}

/**
 * @ global log objects
 */
var _confs  = config.find('log');
for (var i in _confs) {
  Factory.setLog(i, _confs[i]);
}

/**
 * @ global zookeeper objects
 */
var _confs  = config.find('zookeeper');
for (var i in _confs) {
  Factory.setObject('#zookeeper/' + i, Storage.create(_confs[i]));
}

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

  (function cleanExpiredSession() {
    var sql = 'DELETE FROM client_session WHERE modtime < ' + (Date.now() / 1000 - 1800);
    Factory.getMysql('default').query(sql, function (error, res) {
      if (error) {
        Shark.logException(error);
      } else {
        Factory.getLog('debug').notice('CLEAN_SESSION', res);
      }

      setTimeout(cleanExpiredSession, 600000);
    });
  })();
});

events.wait('ok', function () {
  events.emit('ok');
});

