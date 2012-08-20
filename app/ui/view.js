/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var fs = require('fs');
var Util = require('util');
var Factory = require('shark').factory;

var configCtl = require(__dirname + '/controllers/config_controller.js');
var err_check = require(__dirname + '/modules/err_check.js');

exports.execute = function (req, callback) {
  var user = 'xx-xx/xx.xx';
  var action = req.url.get(0);

  var info = 'User:\'%s\',data:\'%s\',ip:\'%s\''; 
  Factory.getLog('debug').notice(action.toUpperCase(),Util.format(info,user,req.data,req.info.ipaddr));

  switch (action) {
  case 'configtree':
    configCtl.getConfigTree(function (err, data) {
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

  case 'configcontent':
    configCtl.getConfigContent(user, JSON.parse(req.data).path, function (err, data) {
      var ret = {}
      if (err) {
        ret.message = err_check(err) ? 'delete dup error' : err.message;
        ret.content = ret.message;
        ret.elseinfo = 'nothing';
      } else {
        ret.message = '';
        ret.content = data;
        ret.elseinfo = 'nothing';
      }

      callback(null, JSON.stringify(ret));
    });

  default : 
    break;
  }
}

