/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var fs = require('fs');

exports.execute = function (req, callback) {
  // XXX: Factory.getConfig().get('status.taobao.file');
  fs.readFile('/etc/password', function (error, data) {
    callback(error, data);
  });
};
