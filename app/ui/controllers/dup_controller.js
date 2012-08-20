/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */
/**
 * @author yixuan
 */

var crypto  = require('crypto');
var Factory = require('shark').factory;
var IError  = require(__dirname + '/../../common/ierror.js');
var Tool    = require(__dirname + '/../../common/tool.js');
var svn_wrapper   = require(__dirname + '/../wrappers/svn_wrapper.js')
var mysql_wrapper = require(__dirname + '/../wrappers/mysql_wrapper.js');

/*{{{ getUserDups() */
/**
 * 获取具体id的副本
 */
function getUserDups(id, callback){
  mysql_wrapper.getDups(id, function (err, data) {
    if (err) {
      callback(err);
    } else {
      for (var i = 0; i < data.length; i++) {
        data[i].addtime = Tool.dateFormat(data[i].addtime);
        data[i].modtime = Tool.dateFormat(data[i].modtime);
      }
      callback(null, data);
    }
  });
}
exports.getUserDups = getUserDups;
/*}}}*/

/*{{{ createDup() */
/**
 * 新建已存在配置文件的副本
 */
function createDup(id, path, type, callback){
  path = Tool.normalize(path);

  mysql_wrapper.getDups(id, function (err, data) {
    if (err) {
      callback(err);
      return;
    }

    var exist = false;
    for (var i = 0; i < data.length; i++) {
      if (data[i].path === path) {
        exist = true;
        break;
      }
    }

    if (exist) {
      callback(IError.create('PATH_DUP_EXISTS', 'dup exists'));
      return;
    }

    svn_wrapper.readFile(path, type, function (err, data) {
      if (err) {
        callback(err);
        return;
      } 

      mysql_wrapper.checkAcl(id, path, mysql_wrapper.statics['ACL_WRITE'], function (err) {
        if (err) {
          callback(IError.create('ACL_WRITE_NOT_PERMITTED', id + ' has no right to write ' + path));
          return;
        }

        mysql_wrapper.addDup(id, path, type, data, function (err) {
          if (err) {
            callback(err);
            return;
          }
          callback();
        });
      });
    });
  });
}
exports.createDup = createDup;
/*}}}*/

/*{{{ saveDup() */
function saveDup(id, path, content, callback){
  mysql_wrapper.updateDupContent(id, path, content, function (err) {
    if (err) {
      callback(err);
    } else {
      callback();
    }
  });
}
exports.saveDup = saveDup;
/*}}}*/

/*{{{ deleteDup() */
function deleteDup(id, path, callback){
  mysql_wrapper.deleteDup(id, path, function (err) {
    if (err) {
      callback(err);
    } else {
      callback();
    }
  });
}
exports.deleteDup = deleteDup;
/*}}}*/

