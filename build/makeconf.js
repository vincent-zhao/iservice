/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var os = require('os'), path = require('path');

var Builder = require(__dirname + '/../lib/build.js');

var Home    = __dirname + '/../';

/**
 * @强制参数 
 */
var _force  = {};

/* {{{ process argv parse */

process.argv.slice(2).forEach(function (arg) {
  if (!(/^\-D/.test(arg))) {
    return;
  }

  var pattern   = arg.slice(2).split('=');
  switch (pattern.length) {
    case 0:
      break;

    case 1:
      _force[pattern[0]]    = true;
      break;

    default:
      _force[pattern[0]]    = pattern[1];
      break;
  }
});
/* }}} */

var _props  = path.normalize(Home + 'default-' + os.hostname() + '-' + os.arch() + '.properties');
if (!path.existsSync(_props) || 1) {
  Builder.init(null, Home, {
    'dir.root'      : Home,
    'log.root'      : Home + 'log/',

    'mysql.default.host'        : '127.0.0.1,localhost',
    'mysql.default.port'        : 3306,
    'mysql.default.user'        : 'root',
    'mysql.default.password'    : '',
    'mysql.default.dbname'      : '',

    /**
     * @redis配置
     */
    'redis.default.host'        : '127.0.0.1:6379,localhost:6379',

  }).makeconf('build/tpl/default.properties', _props);
}

var _me = Builder.init(_props, Home, _force);

/* {{{ task_make_test() */
var task_make_test = function () {
  _me.makedir('test/unit/etc');
  _me.makedir('test/unit/tmp');

  _me.makeconf('build/test/test_config_file.ini',   'test/unit/etc/test_config_file.ini');
  _me.makeconf('build/test/test_config_file.js',    'test/unit/etc/test_config_file.js');
  _me.makeconf('build/test/test_config_file.json',  'test/unit/etc/test_config_file.json');

  _me.makeconf('build/test/mysql.ini',    'test/unit/etc/mysql_test.ini', {
    'mysql.default.pass'      : _me.$('mysql.default.password'),
  });
  _me.makeconf('build/test/redis.ini',    'test/unit/etc/redis.ini');
};

/* }}} */

/* {{{ task_make_bin() */

var task_make_bin = function () {
  _me.makedir('bin');
  _me.makedir(_me.$('log.root'));
  _me.makeconf('build/codes/appctl.sh',   'bin/appctl', {
    'app.name'        : 'shark',
    'nodejs.bin'      : _me.$('nodejs.bin', '/usr/local/bin/node'),
  });
  Builder.setmode('bin/appctl', 0755);

  _me.makeconf('build/codes/shark.js',    'bin/shark.js', {
    'app.name'        : 'shark',
    'nodejs.bin'      : _me.$('nodejs.bin', '/usr/local/bin/node'),
  });
  Builder.setmode('bin/shark.js', 0755);

  _me.makeconf('build/codes/logrotate.sh',   'bin/logrotate');
  Builder.setmode('bin/logrotate', 0755);
};
/* }}} */

task_make_test();
task_make_bin();

