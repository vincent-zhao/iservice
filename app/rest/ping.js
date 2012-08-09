/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var factory = require('shark').factory;
var fs = require('fs');

exports.execute = function (req, callback) {
  var fname = factory.getConfig('rest').get('statusfile', __dirname + '/../../public/status');
  fs.readFile(fname, function (error, data) {
    callback(null, data || error.stack, error ? 404 : 200);
  });
};
