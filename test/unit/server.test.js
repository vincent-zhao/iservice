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
    urllib.request('http://localhost:33751', {}, function (error, data) {
      should.ok(!error);
      done();
      });
  });
  /* }}} */

});

after(function () {
  server.close();
});

