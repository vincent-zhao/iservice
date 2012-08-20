/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";
var Util = require('util');
var taskCtl = require(__dirname + '/controllers/task_controller.js');
var err_check = require(__dirname + '/modules/err_check.js');
var Factory = require('shark').factory;

exports.execute = function (req, callback) {
  var user = 'xx-xx/xx.xx';
  var action = req.url.get(0);

  var info = 'User:\'%s\',data:\'%s\',ip:\'%s\''; 
  Factory.getLog('debug').notice(action.toUpperCase(),Util.format(info,user,req.data,req.info.ipaddr));

  switch (action) {
  case 'gettasks':
    taskCtl.getTasks(user, function (err, data) {
      var ret = {}
      if (err) {
        ret.message = err_check(err) ? 'delete dup error' : err.message;
      } else {
        ret.message = '';
        ret.data = data;
      }
      
      callback(null, JSON.stringify(ret));
    });
    break;

  case 'gettaskdups':
    taskCtl.getTaskDups(user, JSON.parse(req.data).version, function (err, data) {
      var ret = {}
      if (err) {
        ret.message = err_check(err) ? 'delete dup error' : err.message;
      } else {
        ret.message = '';
        ret.data = data;
      }
      
      callback(null, JSON.stringify(ret));
    });
    break;

  default:
    break;
  }
}

