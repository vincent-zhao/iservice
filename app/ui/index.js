/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var Loader = require('shark').factory.getObject('loader');

exports.execute = function (req, callback) {
  callback(null, Loader.get('/index.html'));
};
