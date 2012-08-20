/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

/*{{{ Map */
var Map = {
  'Jan' : 1,
  'Feb' : 2,
  'Mar' : 3,
  'Apr' : 4,
  'May' : 5,
  'Jun' : 6,
  'Jul' : 7,
  'Aug' : 8,
  'Sept' : 9,
  'Oct' : 10,
  'Nov' : 11,
  'Dec' : 12
}
/*}}}*/

exports.normalize = function (path) {
  path = '/' + path + '/';
  while (path.match(/\/{2,}/)) {
    path = path.replace(/\/{2,}/, '/');
  }
  if (path === '/') {
    return path;
  } else {
    return path.substr(0, path.length - 1);
  }
}

exports.dateFormat = function (str) {
  var splits = str.toLocaleString().split(' ');
  return require('util').format('%s-%s-%s %s', splits[3], Map[splits[1]], splits[2], splits[4]);
}
