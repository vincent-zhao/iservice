/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var Loader = require('shark').factory.getObject('loader');

exports.execute = function (req, callback) {
  var path = '';
  var part = '';
  while ((part = req.url.shift())) {
    path += '/' + part;
  }
  callback(null, Loader.get(path));
};
