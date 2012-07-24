/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var should  = require('should');
var storage = require(__dirname + '/../../app/common/storage.js');

describe('storage with zookeeper test', function () {

  /* {{{ should_zookeeper_set_and_get_works_fine() */
  it('should_zookeeper_set_and_get_works_fine', function (done) {
    var _me = storage.create({
      'hosts' : 'localhost:2181'
    });

    _me.get('/i/am/not/exists/' + process.pid, function (error, data) {
      error.should.have.property('name', 'NotFound');
      should.ok(!data);
      _me.set('/key1', process.pid, function (error) {
        should.ok(!error);

        _me.get('key1', function (error, data) {
          should.ok(!error);
          data.should.eql(process.pid.toString());
          done();
        });
      });
    });
  });
  /* }}} */

});
