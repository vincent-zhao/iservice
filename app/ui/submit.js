/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var Util = require('util');
var IError = require(__dirname + '/../common/ierror.js');
var submitCtl = require(__dirname + '/controllers/submit_controller.js');
var err_check = require(__dirname + '/modules/err_check.js');
var Factory = require('shark').factory;

exports.execute = function (req, callback) {
  var user = 'xx-xx/xx.xx';
  var action = req.url.get(0);

  var info = 'User:\'%s\',data:\'%s\',ip:\'%s\''; 
  Factory.getLog('debug').notice(action.toUpperCase(),Util.format(info,user,req.data,req.info.ipaddr));

  switch (action) {
  case 'createtask':
    submitCtl.createTask(user, function (err) {
      var ret = {}
      if (err) {
        ret.message = err_check(err) ? 'delete dup error' : err.message;
      } else {
        ret.message = '';
      }
      
      callback(null, JSON.stringify(ret));
    });
    break;

  case 'taskreply':
    submitCtl.taskReply(req.url, function (err) {
      var ret = {}
      if (err) {
        ret.message = err_check(err) ? 'delete dup error' : err.message;
      } else {
        ret.message = '';
      }
      
      callback(null, JSON.stringify(ret));
    });
    break;

  default:
    break;
  }

}
