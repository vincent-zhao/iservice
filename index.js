/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var Handle = require('./client');
console.log(Handle);

var Util    = require('util');

var Master  = require('node-cluster').Master({
  'pidfile' : __dirname + '/bench.pid',
});

Master.on('giveup', function (name, fatals) {
  //XXX: alert
  console.log(Util.format('Master giveup to restart %s process after %d times.', name, fatals));
});

