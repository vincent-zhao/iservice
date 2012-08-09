/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var http    = require('http');
var should  = require('should');
var urllib  = require('urllib');

var server  = require(__dirname + '/../../app/common/server.js').create({
  'header_prefix'   : 'x-test-',
    'control_root'  : __dirname + '/fixtures/control',
}).listen(33751);

describe('http server', function () {

  /* {{{ should_server_suite_works_fine() */
  it('should_server_suite_works_fine', function (done) {

    var req = {
      'type' : 'POST',
    'data'   : {
      'a' : 'b', 'cd' : 1
    },
    'headers' : {
      'x-test-a1' : '12345',
    'x-testa2'    : 'lalala',
    'x-real-ip'   : '1.1.1.2',
    }
    };
    urllib.request('http:/' + '/localhost:33751/default/hello/aa/bb', req, function (error, data) {
      should.ok(!error);
      data  = JSON.parse(data.toString());
      data.should.have.keys('time', 'url', 'data', 'info');
      data.should.have.property('data', 'a=b&cd=1');
      JSON.stringify(data.info).should.eql(JSON.stringify({
        'a1'    : '12345',
        'ipaddr': '1.1.1.2'
      }));
      done();
    });
  });
  /* }}} */

});

after(function () {
  server.close();
});

