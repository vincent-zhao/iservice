/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var iError = require(__dirname + '/../../../app/common/ierror.js');

exports.execute = function (req, callback) {

  var error = null;
  var data  = '';
  var info  = {'hello' : 'world'};

  switch (req.url.get(0)) {
    case 'error':
      error = iError.create('TestError', req.url.get(1));
      break;

    case 'data':
      data  = req.url.get(1);
      break;

    default:
      break;
  }

  callback(error, data, info);

};
