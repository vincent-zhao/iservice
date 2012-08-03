/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var Builder = require('shark').build;
var Home    = __dirname;
var Path    = require('path');

var _props  = Home + '/default.properties';
if (process.argv.length > 2) {
  _props  = Path.normalize(process.argv[2]);
}
if (!Path.existsSync(_props)) {
  console.log('Property file (' + _props + ') not found.');
  process.exit(1);
}

Builder.init(_props, Home).makeconf('build/tpl', 'etc/', {
  'dir.root' : Home,
});

var cfg = require('shark').config.create(Home + '/etc/master.ini');
var app = require('pm').createMaster(cfg.get('master', {
  'pidfile' : Home + '/run/iservice.pid',
}));

app.on('giveup', function (group, fatals) {
  console.log('Master giveup to restart %s process after %d times.', group, fatals);
});

var workers = cfg.find('worker');
for (var group in workers) {
  if (group && workers[group].script) {
    app.register(group, workers[group].script, workers[group]);
  }
}

