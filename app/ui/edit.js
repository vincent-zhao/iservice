/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";
var Util = require('util');
var Factory = require('shark').factory;
var dupCtl = require(__dirname + '/controllers/dup_controller.js');
var err_check = require(__dirname + '/modules/err_check.js');

exports.execute = function (req, callback) {
  var user = 'xx-xx/xx.xx';
  var action = req.url.get(0);

  var info = 'User:\'%s\',data:\'%s\',ip:\'%s\''; 
  Factory.getLog('debug').notice(action.toUpperCase(),Util.format(info,user,req.data,req.info.ipaddr));

  switch (action) {
  case 'getdups' :
    dupCtl.getUserDups(user, function (err, data) {
      var ret = {}
      if (err) {
        ret.message = err_check(err) ? 'get dups error' : err.message;
      } else {
        ret.message = '';
        ret.data = data;
      }

      callback(null, JSON.stringify(ret));
    });
    break;

  case 'createdup' :
    var obj = JSON.parse(req.data);
    dupCtl.createDup(user, obj.path, obj.type, function (err) {
      var ret = {}
      if (err) {
        ret.message = err_check(err) ? 'create dup error' : err.message;
      } else {
        ret.message = '';
      }

      callback(null, JSON.stringify(ret));
    });
    break;

  case 'savedup' :
    var obj = JSON.parse(req.data);
    dupCtl.saveDup(user, obj.path, obj.content, function (err) {
      var ret = {}
      if (err) {
        ret.message = err_check(err) ? 'save dup error' : err.message;
      } else {
        ret.message = '';
      }

      callback(null, JSON.stringify(ret));
    });
    break;

  case 'deletedup' :
    dupCtl.deleteDup(user, JSON.parse(req.data).path, function (err) {
      var ret = {}
      if (err) {
        ret.message = err_check(err) ? 'delete dup error' : err.message;
      } else {
        ret.message = '';
      }

      callback(null, JSON.stringify(ret));
    });
    break;

  default :
    break;
  }
}

