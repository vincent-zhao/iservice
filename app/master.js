/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var Master  = require('pm').createMaster({
  'pidfile'    : __dirname + '/../iservice.pid',
});

Master.register('api',   __dirname + '/core.js', {
  'listen'  : [ 33749 ],
  'children': 1,
});

Master.on('giveup', function (name, fatals) {
  console.log('Master giveup to restart %s process after %d times.', name, fatals);
});

