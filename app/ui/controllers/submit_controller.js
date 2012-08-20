/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */
/**
 * @author yixuan
 */

var fs = require('fs');
var crypto = require('crypto');

var Factory = require('shark').factory;
var Tool = require(__dirname + '/../../common/tool.js');
var IError = require(__dirname + '/../../common/ierror.js');
var storage = require(__dirname + '/../../common/storage.js');
var svn_wrapper = require(__dirname + '/../wrappers/svn_wrapper.js');
var mysql_wrapper = require(__dirname + '/../wrappers/mysql_wrapper.js');
var sender = require(__dirname + '/../modules/sender.js');

/*{{{ createTask() */
function createTask(id, callback){
  mysql_wrapper.getDups(id, function (err, data) {
    if (err) {
      callback(err);
      return;
    } 

    if (data.length === 0) {
      callback(IError.create('NO_DUPS',id + ' has no dups to submit'));
      return;
    }

    checkAdmin(data, function (err, admin) {
      if (err) {
        callback(err);
        return;
      }
      
      var steps = 3;
      var check = function (err) {
        if (err) {
          callback(err);
          return;
        }
        if (--steps === 0) {
          var token = makeToken();
          mysql_wrapper.addTask(id, data[0].version, token, function (err, taskId) {
            if (err) {
              callback(err);
              return;
            } 
            mysql_wrapper.updateDupsState(id, data[0].version, mysql_wrapper.statics['DUP_CHECKING'], function (err) {
              if (err) {
                callback(err);
                return;
              }
              sender.send(taskId, token, admin, callback);
            });
          });
        }
      }

      checkAllAcl(id, data, check);
      checkMd5(data, check);
      checkConflict(data, check);
    });
  });
}
exports.createTask = createTask;
/*}}}*/

/*{{{ taskReply() */
function taskReply(urlArr, callback){
  var taskId = parseInt(urlArr.get(1));
  var admin  = decodeURIComponent(urlArr.get(2));
  var token  = urlArr.get(3);
  var action = urlArr.get(4);

  mysql_wrapper.getTaskById(taskId, function (err, data) {
    if (err) {
      callback(err);
      return;
    }

    data = data[0];

    if (data.state !== mysql_wrapper.statics['TASK_CHECKING']) {
      callback(IError.create('TASK_HAS_CHECKED','task has checked. check time:' + data.checktime));
      return;
    }
    if (data.token !== token) {
      callback(IError.create('TOKEN_NOT_MATCHED', 'token in url is not matched'));
      return;
    }

    var obj = {}
    for (var i in data){
      obj[i] = data[i];
    }
    obj.adminid = admin;

    if (action === 'reject') {
      obj.dupState = mysql_wrapper.statics['DUP_REJECTED'];
      obj.taskState = mysql_wrapper.statics['TASK_REJECTED'];
      obj.attachment = 'task is rejected by ' + admin;
      updateStates(obj, function (err) {
        if (err) {
          callback(err);
          return;
        }
        callback();
      });

    } else if (action === 'adopt') {
      obj.dupState = mysql_wrapper.statics['DUP_ADOPTED'];
      obj.taskState = mysql_wrapper.statics['TASK_ADOPTED'];
      updateStates(obj, function (err) {
        if (err) {
          callback(err);
          return;
        }
        callback();

        pushSvn(obj, function (err, dups, version) {
          if (err) {
            dealFailure(obj, err);
            return;
          }

          listNodes(dups, version, function (err, map) {
            if (err) {
              dealFailure(obj, err);
              return;
            }

            zkPush(map, function (err) {
              if (err) {
                dealFailure(obj, err);
                return;
              }
              dealSuccess(obj);
            });
          });
        });
      });
    }
  });
}
exports.taskReply = taskReply;
/*}}}*/

/*{{{ checkAllAcl() */
/**
 * 检查是否所有文件都有权限修改
 */
function checkAllAcl(id, dups, callback){
  var count = dups.length;
  dups.forEach(function (dup) {
    mysql_wrapper.checkAcl(id, dup.path, mysql_wrapper.statics['ACL_WRITE'], function (err) {
      if (err) {
        callback(IError.create('ACL_WRITE_REJECTED', id + ' has no route to write \'' + dup.path + '\''));
        return;
      }

      if (--count === 0) {
        callback();
      }
    });
  });
}
/*}}}*/

/*{{{ checkAdmin() */
/**
 * 检测所有文件是不是归一个负责人负责
 */
function checkAdmin(dups, callback){
  var count = dups.length;
  var admin;
  dups.forEach(function (dup) {
    mysql_wrapper.getAdmin(dup.path, function (err, adminid) {
      if (err) {
        callback(err);
        return;
      }

      if (!admin) {
        admin = adminid;
      } else {
        if (admin !== adminid) {
          callback(IError.create('NOT_SAME_ADMIN','not same admin'));
          return;
        }
      }

      if (--count === 0) {
        callback(null, admin);
      }
    });
  });
}
exports.checkAdmin = checkAdmin;
/*}}}*/

/*{{{ checkMd5() */
/**
 * 通过md5值检查文件是否在副本创建后改动过
 */
function checkMd5(dups, callback){
  var count = dups.length;
  dups.forEach(function (dup) {
    svn_wrapper.readFile(dup.path, 'F', function (err, data) {
      if (err) {
        callback(err);
        return;
      }

      var md5 = crypto.createHash('md5').update(data).digest('hex');
      if (md5 !== dup.origin_md5) {
        callback(IError.create('FILE_CHANGED',dup.path + ' has changed'));
        return;
      }

      if (--count === 0) {
        callback();
      }
    });
  });
}
exports.checkMd5 = checkMd5;
/*}}}*/

/*{{{ checkConflict() */
function checkConflict(dups, callback){
  var count = dups.length;
  var states = [mysql_wrapper.statics['DUP_CHECKING']];
  dups.forEach(function (dup) {
    mysql_wrapper.checkDupState(dup.path, states, function (err, data) {
      if (data.length !== 0) {
        callback(err);
        return;
      }

      if (--count === 0) {
        callback();
      }
    });
  });
}
exports.checkConflict = checkConflict;
/*}}}*/

/*{{{ pushSvn() */
function pushSvn(taskObj, callback){
  mysql_wrapper.getDups(taskObj.userid, mysql_wrapper.statics['DUP_ADOPTED'], function (err, data) {
    if (err) {
      callback(err);
      return;
    }

    var count = data.length;
    data.forEach(function (dup) {
      svn_wrapper.writeFile(dup.path, dup.content, dup.node_type, function (err) {
        if (err) {
          callback(err);
          return;
        }

        if (--count === 0) {
          svn_wrapper.submit(function (err) {
            if (err) {
              callback(err);
              return;
            }
            svn_wrapper.update(function (err, version) {
              if (err) {
                callback(err);
                return;
              }
              callback(null, data, version);
            });
          });
        }
      });
    });
  });
} 
/*}}}*/

/*{{{ listNodes() */
function listNodes(dups, version, callback){
  var map = {};
  dups.forEach(function (dup) {
    var path = dup.path;
    var elements = path.split('/');
    for (var i = 2; i <= elements.length; i++) {
      map[Tool.normalize(elements.slice(1,i).join('/'))] = version.toString();
    }
  });

  var count = dups.length;
  dups.forEach(function (dup) {
    svn_wrapper.readFile(dup.path, dup.node_type, function (err, data) {
      if (err) {
        callack(err);
        return;
      }
      map[dup.path] = data;

      if (--count === 0) {
        callback(null, map);
      }
    });
  });

}
/*}}}*/

/*{{{ zkPush()*/
function zkPush(map, callback){
  var zk = storage.create(Factory.getConfig('ui').find('zookeeper')['default']);
  var list = [];
  for (var i in map) {
    list.push({
      key : i,
      val : map[i] 
    });
  }

  var count = list.length;
  list.forEach(function (node) {
    zk.set(node.key, node.val, function (err) {
      if (err) {
        callback(err);
        return;
      }
      if (--count === 0) {
        callback();
      }
    });
  });
}
/*}}}*/

/*{{{ makeToken() */
function makeToken(){
  return parseInt(Math.random() * 1000000).toString();
}
/*}}}*/

/*{{{ dealFailure()*/
function dealFailure(obj, err, tag, info){
  obj.dupState   = mysql_wrapper.statics['DUP_FAILED'];
  obj.taskState  = mysql_wrapper.statics['TASK_FAILED'];
  obj.attachment = err.message;
  updateStates(obj, function(err){
    if (err) {
      Factory.getLog('error').error('UPDATE_TASK_STATE_ERROR',err.message);
    }
  });
}
/*}}}*/

/*{{{ dealSuccess() */
function dealSuccess(obj, tag, info){
  obj.dupState   = mysql_wrapper.statics['DUP_SUCCEED'];
  obj.taskState  = mysql_wrapper.statics['TASK_SUCCEED'];
  updateStates(obj, function(err){
    if (err) {
      Factory.getLog('error').error(tag, info + ' | msg:' + err.message);
    }
  });
}
/*}}}*/

/*{{{ updateStates() */
function updateStates(obj, callback){
  mysql_wrapper.updateDupsState(obj.userid, obj.version, obj.dupState, function (err) {
    if (err) {
      callback(err);
      return;
    }
    mysql_wrapper.updateTaskState(obj.taskid, obj.adminid, obj.taskState, JSON.stringify(obj.attachment), function (err) {
      if (err) {
        callback(err);
        return;
      }
      callback();
    });
  });
}
/*}}}*/

