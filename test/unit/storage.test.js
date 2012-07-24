/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var should  = require('should');
var storage = require(__dirname + '/../../app/common/storage.js');

describe('storage with zookeeper test', function () {

  /* {{{ should_zookeeper_set_and_get_works_fine() */
  it('should_zookeeper_set_and_get_works_fine', function (done) {
    var _me = storage.create({
      'hosts' : 'localhost:2181',
    //    'root': 'unittest'
    });

    _me.get('/i/am/not/exists/' + process.pid, function (error, data) {
      error.should.have.property('name', 'NotFound');
      should.ok(!data);
      _me.set('/test/key1', process.pid, function (error) {
        should.ok(!error);

        _me.get('test/key1', function (error, data) {
          should.ok(!error);
          data.should.eql(process.pid.toString());
          done();
        });
      });
    });
  });
  /* }}} */

  /* {{{ should_zookeeper_watch_works_fine() */
  it('should_zookeeper_watch_works_fine', function (done) {
    var _me = storage.create({
      'hosts' : 'localhost:2181',
    //    'root': 'unittest'
    });

    var res = [];
    var key = '/i/am/not/exists/' + Date.now();
    _me.watch(key, 34, function (curr, prev) {
      if ('2' === curr) {
        done();
      }
    });
    _me.set(key, 1, function (error) {
      should.ok(!error);
      setTimeout(function () {
        _me.set(key, 2, function (error) {
          should.ok(!error);
        });
      }, 100);
    });
  });
  /* }}} */

  it('should_zookeeper_remove_works_fine', function (done) {
    var _me = storage.create({
      'hosts' : 'localhost:2181',
    //    'root': 'unittest'
    });

    _me.remove('/i/am', function (error) {
      done();
    });
  });

});
