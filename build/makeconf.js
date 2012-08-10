/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var os = require('os'), path = require('path');

var Builder = require('shark').build;

var Home    = __dirname + '/..';

/**
 * @强制参数 
 */
var _force  = Builder.parseProperties(Home + '/_private.properties');

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

/* {{{ private function _extend() */
var _extend = function (a, b) {
  var m = require('shark').extend.clone(a);
  for (var i in b) {
    m[i] = b[i];
  }
  return m;
};
/* }}} */

var _props  = path.normalize(Home + '/default-' + os.hostname() + '-' + os.arch() + '.properties');
if (!path.existsSync(_props) || 1) {
  Builder.init(null, Home, _extend({
    'dir.root'      : Home,
    'log.root'      : path.normalize(Home + '/log'),

    /**<    元数据配置  */
    'mysql.default.host'        : 'localhost',
    'mysql.default.port'        : 3306,
    'mysql.default.user'        : 'root',
    'mysql.default.password'    : '',
    'mysql.default.dbname'      : 'meta_iservice_config',

    /**<    zookeeper配置   */
    'zookeeper.default.host'    : 'localhost:2181,127.0.0.1:2181',
    'zookeeper.default.root'    : '/',
    'zookeeper.default.user'    : 'anonymouse',
    'zookeeper.default.pass'    : '123456',
  }, _force)).makeconf('build/tpl/default.properties', _props);
}

var _me = Builder.init(_props, Home, _force);

/* {{{ task_make_test() */
var task_make_test = function () {
  _me.makedir('test/unit/etc');
  _me.makedir('test/unit/tmp');

  _me.makeconf('build/tpl/rest.ini', 'test/unit/etc/rest.ini', {
    'statusfile' : path.normalize(__dirname + '/../test/unit/tmp/status'),
  });
};

/* }}} */

/* {{{ task_make_bin() */

var task_make_bin = function () {
  _me.makedir('bin');
  _me.makedir(_me.$('log.root'));
  _me.makeconf('node_modules/shark/resource/script/appctl.sh',   'bin/appctl', {
    'app.name'      : 'iservice',
    'pid.file'      : _me.$('pid.file', Home + '/run/iservice.pid'),
    '200.file'      : _me.$('200.file', ''),
    'properties'    : _me.$('propfile', _props),
    'node.bin'      : _me.$('node.bin', '/opt/taobao/install/node.js/bin/node'),
  });
  Builder.setmode('bin/appctl', 0755);

  _me.makeconf('node_modules/shark/resource/script/logrotate.sh',   'bin/logrotate');
  Builder.setmode('bin/logrotate', 0755);
};
/* }}} */

task_make_test();
task_make_bin();
process.exit(0);
