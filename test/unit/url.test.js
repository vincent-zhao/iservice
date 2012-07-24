/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var should  = require('should');
var url = require(__dirname + '/../../app/common/url.js');

describe('url test', function () {

  /* {{{ should_url_interface_works_fine() */
  it('should_url_interface_works_fine', function () {
    var _me = url.create('');
    _me.get(0).should.eql('');
    should.ok(null === _me.get(1));

    var _me = url.create('////a/bcd?hello/world');
    _me.get(0).should.eql('a');
    _me.get(1).should.eql('bcd');

    var _me = url.create('a/////bcd' + encodeURIComponent('周华健') + 'hello/world');
    _me.shift().should.eql('a');
    _me.shift().should.eql('bcd周华健hello');
  });
  /* }}} */

});
