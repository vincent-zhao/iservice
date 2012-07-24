/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

exports.create = function (url) {

  /**
   * @ url path
   */
  var paths = [];

  /**
   * @ query data
   */
  var cdata = {};

  url.toString().split('?').shift().split('/').forEach(function (item) {
    item = item.trim();
    if ('' !== item) {
      paths.push(decodeURIComponent(item));
    }
  });
  if (paths.length === 0) {
    paths   = [''];
  }

  var _me   = {};
  _me.get   = function (p) {
    return (undefined !== paths[p]) ? paths[p] : null;
  };

  return _me;
};

