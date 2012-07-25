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
    tmp.info['x-expire'].should.eql(3231);
    tmp.info['x-alefwe'].should.eql('213Acd  ');

    _me.finish('will be ignore', {});
    res.dump().should.eql(tmp);
    done();
  });
  /* }}} */

  /* {{{ should_apply_execute_works_fine() */
  it('should_apply_execute_works_fine', function (done) {
    var res = __response();
    var _me = apply.create(res, '/sdw324234234lk242342343424kslflwf;g', new Buffer('abcd'), {});
    _me.execute();

    var tmp = res.dump();
    tmp.code.should.eql(404);
    tmp.data.should.eql('');

    done();
  });
  /* }}} */

});
