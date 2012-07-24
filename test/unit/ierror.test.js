/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var should  = require('should');
var ierror  = require(__dirname + '/../../app/common/ierror.js');

describe('ierror interface', function () {

  it('should_ierror_interface_works_fine', function () {
    var _me = ierror.create('Hello ', 'this is a string');
    should.ok(_me instanceof Error);
    _me.should.have.property('name', 'Hello ');
    _me.toString().should.include('this is a string');

    _me = ierror.create('lalla', new Error('i am an error object'));
    should.ok(_me instanceof Error);
    _me.should.have.property('name', 'lalla');
    _me.toString().should.include('i am an error object');
  });

});

