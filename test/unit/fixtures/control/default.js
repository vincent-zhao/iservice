/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

exports.execute = function (req, callback) {
  callback(JSON.stringify(req));
};
