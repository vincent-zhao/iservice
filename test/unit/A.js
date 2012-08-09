/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

/* {{{ private function fileset() */
function fileset(dir, callback) {
  var fs = require('fs');

  if (!fs.statSync(dir).isDirectory()) {
    callback(dir);
    return;
  }

  fs.readdirSync(dir).forEach(function(file) {
    if (file.indexOf('.svn') > -1 || /^\._/.test(file)) {
      return;
    }

    var _me = dir + '/' + file;
    if (fs.statSync(_me).isDirectory()) {
      fileset(_me, callback);
    } else {
      callback(_me);
    }
  });
}
/* }}} */

fileset(__dirname + '/../../app', function(fname) {
  if (/\.js$/.test(fname) && !(/\/(rest)\.js$/.test(fname))) {
    require(fname);
  }
});

