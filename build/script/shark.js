#!##nodejs.bin##
/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var Path    = require('path');
var Home    = __dirname + '/../';
var Builder = require(Home + '/lib/build.js');

var _props  = Home + '##app.name##.properties';
if (process.argv.length > 2) {
  _props    = Path.normalize(process.argv[2]);
}
if (!Path.existsSync(_props)) {
  console.log('Property file (' + _props + ') not found.');
  process.exit(1);
}

/* {{{ config files builder  */

var _maker  = Builder.init(_props, Home);

_maker.makedir('run');
_maker.makedir('.etc');

var confdir = Path.normalize(Home + 'build/tpl');
Builder.fileset(confdir, function(fname) {
  var _base = fname.slice(1 + confdir.length);
  if (_base.match(/\.properties$/)) {
    return;
  }

  var _file = Home + '.etc/' + _base;
  _maker.makedir(Path.dirname(_file));
  _maker.makeconf(fname, _file, {
    'app.name'  : '##app.name##',
  });
});

/* }}} */

var config  = require(Home + 'lib/config.js').create(Home + '.etc/master.ini');
var master  = require('pm').createMaster(config.get('master', {
  'pidfile' : Home + 'run/##app.name##.pid',
}));

/* {{{ register worker(s) for master */

var options = config.all();
for (var key in options) {
  var match = key.match(/worker:(\w+)/);
  var child = options[key];
  if (match && child.script) {
    if (child.args) {
      child.args = child.args.split(' ');
    } else {
      child.args = [];
    }
    master.register(match[1], child.script, child);
  }
}

/* }}} */

master.dispatch();
