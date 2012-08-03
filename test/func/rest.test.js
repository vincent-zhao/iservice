/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var should  = require('should');
var client  = require('iservice-client').createClient({
  'hosts'   : 'localhost:33749,127.0.0.1:33749',
    'root'  : '/unittest',
    'user'  : 'root',
    'pass'  : '123456',
    'cache' : __dirname + '/run/cache',
});

describe('api interface', function () {

  it('a', function (done) {
    done();
  });

});
