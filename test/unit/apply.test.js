/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var should  = require('should');
var apply   = require(__dirname + '/../../app/common/apply.js');

/* {{{ moked http response() */
function __response() {

  var _me   = {};

  var _dump = {
    'code'  : 0,
    'info'  : {},
    'data'  : '',
  };

  _me.writeHead = function(code, header) {
    _dump.code  = code;
    _dump.info  = header;
  };

  _me.end       = function(data) {
    _dump.data  = data;
  };

  _me.dump      = function() {
    return _dump;
  };

  return _me;
}
/* }}} */

beforeEach(function () {
  require('shark').factory.cleanAll();
});

describe('apply interface', function () {

  /* {{{ should_apply_create_and_finish_works_fine() */
  it('should_apply_create_and_finish_works_fine', function(done) {
    var res = __response();
    var _me = apply.create(res, '/a/b/c?d=1', new Buffer('abcd'), {});
    _me.should.have.property('time');
    _me.should.have.property('url');
    _me.should.have.property('data');

    /**
     * @强制转换为string, 避免写日志时JSON.stringify出问题
     */
    (typeof _me.data).should.eql('string');

    _me.should.have.property('info');
    _me.url.get(0).should.eql('a');
    _me.url.get(0).should.eql('a');

    _me.finish('test', {
      'expire'  : 3231,
      'alefwe'  : '213Acd  ',
    });

    var tmp = res.dump();
    tmp.code.should.eql(200);
    tmp.data.should.eql('test');
    tmp.info['x-app-expire'].should.eql(3231);
    tmp.info['x-app-alefwe'].should.eql('213Acd  ');

    _me.finish('will be ignore', {});
    res.dump().should.eql(tmp);
    done();
  });
  /* }}} */

  /* {{{ should_apply_execute_works_fine() */
  it('should_apply_execute_works_fine', function () {
    var res = __response();
    var _me = apply.create(res, '/sdw324234234lk242342343424kslflwf;g', new Buffer('abcd'), {});
    _me.execute();

    var tmp = res.dump();
    tmp.code.should.eql(404);
    tmp.data.should.eql('');

    var _me = apply.create(res, '/test/error/this is a test error', new Buffer('abcd'), {});
    _me.execute({
      'root' : __dirname + '/fixtures',
    });

    var tmp = res.dump();
    tmp.code.should.eql(200);
    tmp.data.should.include('this is a test error');

    var _me = apply.create(res, '/test/data/lala', new Buffer('abcd'), {});
    _me.execute({
      'root' : __dirname + '/fixtures',
    });

    var tmp = res.dump();
    tmp.code.should.eql(200);
    tmp.data.should.eql('lala');

    JSON.stringify(tmp.info).should.eql(JSON.stringify({
      'x-app-hello' : 'world'
    }));
  });
  /* }}} */

});

describe('rest index', function () {

  var resp  = __response();
  var ctrol = require(__dirname + '/../../app/rest/index.js');

  /* {{{ should_index_controller_works_fine() */
  it('should_index_controller_works_fine', function (done) {
    var req = apply.create(resp, '', '');
    ctrol.execute(req, function (error, data) {
      should.ok(!error);
      data.should.eql('<!--STATUS OK-->');
      done();
    });
  });
  /* }}} */

});

describe('rest ping', function () {

  var fs = require('fs');

  var fname = __dirname + '/tmp/status';
  var resp  = __response();
  var ctrol = require(__dirname + '/../../app/rest/ping.js');

  beforeEach(function () {
    require('shark').factory.setConfig('rest', __dirname + '/etc/rest.ini');
  });

  /* {{{ should_ping_controller_works_fine() */
  it('should_ping_controller_works_fine', function (done) {
    var req = apply.create(resp, '', '');

    fs.unlink(fname, function (error) {
      should.ok((!error) || 'ENOENT' === error.code);
      ctrol.execute(req, function (error, data) {
        should.ok(!error);
        data.toString().should.include('ENOENT');
        fs.writeFile(fname, 'a', function (error) {
          should.ok(!error);
          ctrol.execute(req, function (error, data) {
            should.ok(!error);
            data.toString().should.eql('a');
            done();
          });
        });
      });
    });
  });
  /* }}} */

});

describe('rest api', function () {

  var resp  = __response();
  var ctrol = require(__dirname + '/../../app/rest/api.js');

  /* {{{ should_rest_api_index_works_fine() */
  it('should_rest_api_index_works_fine', function (done) {
    var req = apply.create(resp, '', '');
    ctrol.execute(req, function (error, data) {
      should.ok(!error);
      data.should.eql(JSON.stringify({
        'error' : null,
        'data'  : '<!--STATUS OK-->',
      }));
      done();
    });
  });
  /* }}} */

  /* {{{ should_rest_api_notfound_works_fine() */
  it('should_rest_api_notfound_works_fine', function (done) {
    var req = apply.create(resp, '/i_am_a_not_found_action', '');
    ctrol.execute(req, function (error, data) {
      error.should.have.property('name', 'ActionNotFound');
      error.message.should.include('Action "i_am_a_not_found_action" not found.');
      done();
    });
  });
  /* }}} */

  /* {{{ should_rest_api_get_works_fine() */
  it('should_rest_api_get_works_fine', function (done) {

    var req = apply.create(resp, '/get/i_am_not_exists.' + process.pid, '');
    ctrol.execute(req, function (error, data) {
      should.ok(!error);
      (JSON.parse(data)).error.should.have.property('name', 'NotFound');

      var req = apply.create(resp, '/get/%2F', '');
      ctrol.execute(req, function (error, data) {
        should.ok(!error);
        should.ok(null !== data);
        done();
      });
    });

  });
  /* }}} */

  /* {{{ should_rest_api_watch_timeout_works_fine() */
  it('should_rest_api_watch_timeout_works_fine', function (done) {
    var req = apply.create(resp, '/watch/test%2Fkey2', '', {'tmout' : 100});

    var now = Date.now();
    ctrol.execute(req, function (error, data) {
      should.ok(!error);
      (Date.now() - now).should.below(110);
      done();
    });
  });
  /* }}} */

  /* {{{ should_rest_api_set_denied_from_other_client() */
  it('should_rest_api_set_denied_from_other_client', function (done) {
    var req = apply.create(resp, '/set/test%2Fkey1', process.pid, {'addr' : 'lalala'});
    ctrol.execute(req, function (error, data) {
      should.ok(!error);
      data  = JSON.parse(data);
      data.error.should.have.property('name', 'AccessDenied');
      done();
    });
  });
  /* }}} */

  /* {{{ should_rest_api_watch_update_works_fine() */
  it('should_rest_api_watch_update_works_fine', function (done) {
    var req = apply.create(resp, '/watch/test%2Fkey3', '', {'interval' : 100});
    var now = Date.now();
    ctrol.execute(req, function (error, data) {
      should.ok(!error);
      done();
    });

    var req = apply.create(resp, '/set/test%2Fkey3', process.pid, {'addr' : '127.0.0.1'});
    ctrol.execute(req, function (error, data) {
      should.ok(!error);
      data.should.eql(JSON.stringify({
        'error' : null,
        'data'  : '',
      }));
    });
  });
  /* }}} */

  /* {{{ should_rest_api_tree_works_fine() */
  it('should_rest_api_tree_works_fine', function (done) {
    var req = apply.create(resp, '/tree/test', '');
    ctrol.execute(req, function (error, data) {
      should.ok(!error);
      (JSON.parse(data)).should.have.property('error', null);
      done();
    });
  });
  /* }}} */

});

