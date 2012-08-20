/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var fs = require('fs');
var exec = require('child_process').exec;

function dump(dir, path, callback){
  exec('cd ' + dir + ' && svn co ' + path, function (error ,stdout, stderr) {
    if (error) {
      callback(new Error(error));
    } else {
      callback(null, stdout.split(' ').pop());
    }
  });
}
exports.dump = dump;

function submit(path, comment, callback){
  exec('svn commit -m \'' + comment + '\' ' + path, function (error, stdout, stderr) {
    if (error) {
      callback(new Error(error));
    } else {
      callback(null, stdout);
    }
  });
}
exports.submit = submit;

function add(path, callback){
  exec('svn add ' + path, function (error, stdout, stderr) {
    if (error) {
      callback(new Error(error));
    } else {
      callback();
    }
  });
}
exports.add = add;

function delete_(path, comment, callback){
  exec('svn delete ' + path, function (error, stdout, stderr) {
    if (error) {
      callback(new Error(error));
    } else {
      submit(path, comment, callback);
    }
  });
}
exports.delete_ = delete_;

function update(path, callback){
  exec('cd ' + path + ' && svn up', function (error, stdout, stderr) {
    if (stdout) {
      callback(null, stdout.split(' ').pop());
    } else {
      callback(null);
    }
  });
}
exports.update = update;

function diff(path, callback){
  exec('svn diff ' + path, function (error, stdout, stderr) {
    if (error) {
      callback(new Error(error));
    } else {
      callback(null, stdout);
    }
  });
}
exports.diff = diff;

