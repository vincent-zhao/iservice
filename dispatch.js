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

Builder.init(_props, Home).makeconf('build/tpl', 'etc', {
  'dir.root' : Home,
});

var cfg = require('shark').config.create(Home + '/etc/master.ini');
var app = require('pm').createMaster(cfg.get('master', {
  'pidfile' : Home + '/run/iservice.pid',
}));

app.on('giveup', function (group, fatals) {
  console.log('Master giveup to restart %s process after %d times.', group, fatals);
});

var options = cfg.all();
for (var i in options) {
  var m = i.match(/worker:(\w+)/);
  var c = options[i];
  if (m && c.script) {
    app.register(m[1], c.script, c);
  }
}

