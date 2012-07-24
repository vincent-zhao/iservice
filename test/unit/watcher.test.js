/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var should  = require('should');
var watcher = require(__dirname + '/../../app/common/watcher.js');

describe('watcher test', function () {

  /* {{{ should_watcher_push_and_emit_works_fine() */
  it('should_watcher_push_and_emit_works_fine', function (done) {
    var _me = watcher.create();
    var num = 2;
    _me.push(function (data) {
      data.should.eql(456);
      if ((--num) === 0) {
        done();
      }
    });
    _me.push(function (data) {
      data.should.eql(456);
      if ((--num) === 0) {
        done();
      }
    });

    _me.emit(123);
    _me.emit(456);
  });
  /* }}} */

  /* {{{ should_watcher_recall_works_fine() */
  it('should_watcher_recall_works_fine', function (done) {
    var _me = watcher.create(5, 20);
    var num = 3;
    _me.push(function (data) {
      data.should.eql(123);
      if ((--num) === 0) {
        done();
      }
    });

    _me.emit(123);
    _me.push(function (data) {
      data.should.eql(123);
      if ((--num) === 0) {
        done();
      }
    });

    setTimeout(function () {
      if ((--num) === 0) {
        done();
      }
      _me.push(function (data) {
        'This is cannot be called'.shoule.eql('');
      });
    }, 22);
  });
  /* }}} */

  /* {{{ should_watcher_emit_delay_works_fine() */
  it('should_watcher_emit_delay_works_fine', function (done) {
    var _me = watcher.create(5);

    var res = [];
    _me.push(function (data) {
      res.push(data);
      if (res.length === 2) {
        res.should.eql([456, 789]);
        done();
      }
    });

    _me.emit(123);
    _me.emit(456);
    setTimeout(function () {
      _me.emit(789);
    }, 6);
  });
  /* }}} */

});
