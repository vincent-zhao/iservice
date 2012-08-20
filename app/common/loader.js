/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */
/**
 * author: yixuan.zzq
 */

var fs = require('fs');

var cache = {}

function load(path, key){
  key = key || '';
  if (fs.statSync(path).isDirectory()) {
    var files = fs.readdirSync(path);
    for (var i = 0; i < files.length; i++) {
      load(path + '/' + files[i], key + '/' + files[i]);
    }

  } else {
    read(key, path);
    watch(path, function(){
      read(key, path);
    });
  }
}
exports.load = load;

function read(key, file){
  cache[key] = fs.readFileSync(file);
}

function watch(file, cb){
  fs.watchFile(file, function (curr, prev) {
    if (curr.mtime.getTime() !== prev.mtime.getTime()) {
      cb();
    }
  });
}

function get(key){
  return cache[key];
}
exports.get = get;


