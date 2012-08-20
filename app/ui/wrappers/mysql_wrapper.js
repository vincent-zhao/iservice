/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */
/**
 * @author yixuan
 */

var Util    = require('util');
var crypto  = require('crypto');
var IError  = require(__dirname + '/../../common/ierror.js');
var Factory = require('shark').factory;
var Tool    = require(__dirname + '/../../common/tool.js');

/*{{{ statics */
var statics = {
  'TASK_CHECKING' : 0,
  'TASK_ADOPTED'  : 1,
  'TASK_REJECTED' : 2,
  'TASK_SUCCEED'  : 3,
  'TASK_FAILED'   : 4,

  'DUP_EDITING'   : 0,
  'DUP_CHECKING'  : 1,
  'DUP_REJECTED'  : 2,
  'DUP_ADOPTED'   : 3,
  'DUP_SUCCEED'   : 4,
  'DUP_FAILED'    : 5,

  'ACL_READ'      : 1,
  'ACL_WRITE'     : 2,
  'ACL_ADMIN'     : 4,
}
exports.statics = statics
/*}}}*/

/*{{{ getDups() */
/**
 * 获取副本
 * @param {String} id 域账号
 * @param {Function} callback
 */
function getDups(id, state, callback){
  if (typeof state === 'function') {
    callback = state;
    state = statics['DUP_EDITING'];
  }
  var mysql = Factory.getMysql('ui');

  var tbname = Factory.getConfig('ui').find('mysql')['ui']['duplicate_tbname'];
  var sql = 'SELECT * FROM %s WHERE userid = \'%s\' and state = %d';
  sql = Util.format(sql, tbname, id, state);

  Factory.getLog('mysql').notice('GET_DUPS', sql);
  mysql.query(sql, function (err, rows) {
    if (err) {
      var info = Util.format('sql:\'%s\',errmsg:\'%s\'', sql, err.message);
      Factory.getLog('mysql').error('GET_DUPS', info);
      callback(IError.create('MYSQL_ERROR', err.message));
    } else {
      callback(null, rows);
    }
  });
}
exports.getDups = getDups;
/*}}}*/

/*{{{ getDupsByVersion() */
function getDupsByVersion(id, version, callback){
  var mysql = Factory.getMysql('ui');

  var tbname = Factory.getConfig('ui').find('mysql')['ui']['duplicate_tbname'];
  var sql = 'SELECT path,content,modtime,node_type FROM %s WHERE userid = \'%s\' and version = %d';
  sql = Util.format(sql, tbname, id, version);

  Factory.getLog('mysql').notice('GET_DUPS_BY_VERSION', sql);
  mysql.query(sql, function (err, rows) {
    if (err) {
      var info = Util.format('sql:\'%s\',errmsg:\'%s\'', sql, err.message);
      Factory.getLog('mysql').error('GET_DUPS_BY_VERSION', info);
      callback(IError.create('MYSQL_ERROR', err.message));
    } else {
      callback(null, rows);
    }
  });
}
exports.getDupsByVersion = getDupsByVersion;
/*}}}*/

/*{{{ getDupVersion() */
function getDupVersion(id, callback){
  getDups(id, function (err, data) {
    if (err) {
      callback(err);
      return;
    } 

    if (data.length === 0) {
      var mysql = Factory.getMysql('ui');
      var tbname = Factory.getConfig('ui').find('mysql')['ui']['duplicate_tbname'];

      var sql = 'SELECT version FROM %s WHERE userid = \'%s\' ORDER BY version DESC limit 1';
      sql = Util.format(sql, tbname, id);

      Factory.getLog('mysql').notice('GET_DUP_VERSION', sql);
      mysql.query(sql, function (err, data) {
        if (err) {
          var info = Util.format('sql:\'%s\',errmsg:\'%s\'', sql, err.message);
          Factory.getLog('mysql').error('GET_DUP_VERSION', info);
          callback(IError.create('MYSQL_ERROR', err.message));
          return;
        }

        if (data.length === 0) {
          callback(null, 1);
        } else {
          callback(null, data[0].version + 1);
        }
      });

      return;
    }
    callback(null, data[0].version);
  });
}
exports.getDupVersion = getDupVersion;
/*}}}*/

/*{{{ addDup() */
/**
 * 添加副本
 * @param {String} id 域账号
 * @param {String} path 配置路径
 * @param {Function} callback
 */
function addDup(id, path, type, content, callback){
  getDupVersion(id, function (err, version) {
    if (err) {
      callback(err);
      return;
    }
    var mysql = Factory.getMysql('ui');

    var tbname = Factory.getConfig('ui').find('mysql')['ui']['duplicate_tbname'];
    var md5 = crypto.createHash('md5').update(content).digest('hex');
    var sql = 'INSERT INTO %s(userid, path, node_type, content, version, origin_md5, addtime, modtime) VALUES (\'%s\', \'%s\', \'%s\', \'%s\', %d, \'%s\', now(), now())';
    sql = Util.format(sql, tbname, id, path, type, content, version, md5);

    Factory.getLog('mysql').notice('ADD_DUP', sql);
    mysql.query(sql, function (err, rows) {
      if (err) {
        var info = Util.format('sql:\'%s\',errmsg:\'%s\'', sql, err.message);
        Factory.getLog('mysql').error('ADD_DUP', info);
        callback(IError.create('MYSQL_ERROR', err.message));
      } else {
        callback(null, rows);
      }
    });
  });
}
exports.addDup = addDup;
/*}}}*/

/*{{{ updateDupContent() */
/**
 * 更新副本内容
 * @param {String} id 域账号
 * @param {String} path 配置路径
 * @param {String} content 内容
 * @param {Function} callback
 */
function updateDupContent(id, path, content, callback){
  var mysql = Factory.getMysql('ui');

  var tbname = Factory.getConfig('ui').find('mysql')['ui']['duplicate_tbname'];
  var sql = 'UPDATE %s SET content = \'%s\', modtime = now() where userid = \'%s\' and path = \'%s\' and state = %d';
  sql = Util.format(sql, tbname, content, id, path, statics['DUP_EDITING']);

  Factory.getLog('mysql').notice('UPDATE_DUP_CONTENT', sql);
  mysql.query(sql, function (err, rows) {
    if (err) {
      var info = Util.format('sql:\'%s\',errmsg:\'%s\'', sql, err.message);
      Factory.getLog('mysql').error('UPDATE_DUP_CONTENT', info);
      callback(IError.create('MYSQL_ERROR', err.message));
    } else {
      callback(null, rows);
    }
  });
}
exports.updateDupContent = updateDupContent;
/*}}}*/

/*{{{ updateDupsState() */
/**
 * 更新副本状态
 * @param {String} id 域账号
 * @param {String} content 内容
 * @param {Function} callback
 */
function updateDupsState(id, version, state, callback){
  var mysql = Factory.getMysql('ui');

  var tbname = Factory.getConfig('ui').find('mysql')['ui']['duplicate_tbname'];
  var sql = 'UPDATE %s SET state = \'%s\' where userid = \'%s\' and version = %d';
  sql = Util.format(sql, tbname, state, id, version);

  Factory.getLog('mysql').notice('UPDATE_DUP_STATE', sql);
  mysql.query(sql, function (err, rows) {
    if (err) {
      var info = Util.format('sql:\'%s\',errmsg:\'%s\'', sql, err.message);
      Factory.getLog('mysql').error('UPDATE_DUPS_STATE', info);
      callback(IError.create('MYSQL_ERROR', err.message));
    } else {
      callback(null, rows);
    }
  });
}
exports.updateDupsState = updateDupsState;
/*}}}*/

/*{{{ deleteDup() */
/**
 * 删除副本
 * @param {String} id 域账号
 * @param {String} path 配置路径
 * @param {Function} callback
 */
function deleteDup(id, path, callback){
  var mysql = Factory.getMysql('ui');

  var tbname = Factory.getConfig('ui').find('mysql')['ui']['duplicate_tbname'];
  var sql = 'DELETE FROM %s WHERE userid = \'%s\' and path = \'%s\' and state = %s';
  sql = Util.format(sql, tbname, id, path, statics['DUP_EDITING']);

  Factory.getLog('mysql').notice('DELETE_DUP', sql);
  mysql.query(sql, function (err, rows) {
    if (err) {
      var info = Util.format('sql:\'%s\',errmsg:\'%s\'', sql, err.message);
      Factory.getLog('mysql').error('DELETE_DUP', info);
      callback(IError.create('MYSQL_ERROR', err.message));
    } else {
      callback(null, rows);
    }
  });
}
exports.deleteDup = deleteDup;
/*}}}*/

/*{{{ checkDupState() */
function checkDupState(path, states, callback){
  var mysql = Factory.getMysql('ui');

  var tbname = Factory.getConfig('ui').find('mysql')['ui']['duplicate_tbname'];
  var sql = 'SELECT * FROM %s WHERE path = \'%s\' AND state in (%s)';
  sql = Util.format(sql, tbname, path, states.join(','));

  Factory.getLog('mysql').notice('CHECK_DUP_STATE', sql);
  mysql.query(sql, function (err, rows) {
    if (err) {
      var info = Util.format('sql:\'%s\',errmsg:\'%s\'', sql, err.message);
      Factory.getLog('mysql').error('CHECK_DUP_STATE', info);
      callback(IError.create('MYSQL_ERROR', err.message));
    } else {
      callback(null, rows);
    }
  });
}
exports.checkDupState = checkDupState;
/*}}}*/

/*{{{ getAcl() */
/**
 * 获取权限
 * @param {String} id 域账号
 * @param {Function} callback
 */
function getAcl(id, callback){
  var mysql = Factory.getMysql('ui');

  var tbname = Factory.getConfig('ui').find('mysql')['ui']['acl_tbname'];
  var sql = 'SELECT path, useracl FROM %s where userid = \'%s\'';
  sql = Util.format(sql, tbname, id);

  Factory.getLog('mysql').notice('CHECK_DUP_STATE', sql);
  mysql.query(sql, function (err, rows) {
    if (err) {
      var info = Util.format('sql:\'%s\',errmsg:\'%s\'', sql, err.message);
      Factory.getLog('mysql').error('GET_ACL', info);
      callback(IError.create('MYSQL_ERROR', err.message));
    } else {
      callback(null, rows);
    }
  });
}
exports.getAcl = getAcl;
/*}}}*/

/*{{{ addAcl() */
/**
 * 添加用户权限
 * @param {String} id 域账号
 * @param {String} path 配置路径
 * @param {int} mode 权限(r,w,x)
 * @param {Function} callback
 */
function addAcl(id, path, mode, callback){
  var mysql = Factory.getMysql('ui');

  var tbname = Factory.getConfig('ui').find('mysql')['ui']['acl_tbname'];
  var sql = 'INSERT INTO %s(userid, path, useracl) VALUES (\'%s\', \'%s\', %d)';
  sql = Util.format(sql, tbname, id, path, mode);

  Factory.getLog('mysql').notice('ADD_ACL', sql);
  mysql.query(sql, function (err, rows) {
    if (err) {
      var info = Util.format('sql:\'%s\',errmsg:\'%s\'', sql, err.message);
      Factory.getLog('mysql').error('ADD_ACL', info);
      callback(IError.create('MYSQL_ERROR', err.message));
    } else {
      callback(null, rows);
    }
  });
}
exports.addAcl = addAcl;
/*}}}*/

/*{{{ updateAcl() */
/**
 * 更改权限
 * @param {String} id 域账号
 * @param {String} path 配置路径
 * @param {int} mode 权限(r,w,x)
 * @param {Function} callback
 */
function updateAcl(id, path, mode, callback){
  var mysql = Factory.getMysql('ui');

  var tbname = Factory.getConfig('ui').find('mysql')['ui']['acl_tbname'];
  var sql = 'UPDATE %s SET useracl = %s WHERE userid = \'%s\' and path = \'%s\'';
  sql = Util.format(sql, tbname, mode, id, path);

  Factory.getLog('mysql').notice('UPDATE_ACL', sql);
  mysql.query(sql, function (err, rows) {
    if (err) {
      var info = Util.format('sql:\'%s\',errmsg:\'%s\'', sql, err.message);
      Factory.getLog('mysql').error('UPDATE_ACL', info);
      callback(IError.create('MYSQL_ERROR', err.message));
    } else {
      callback(null, rows);
    }
  });
}
exports.updateAcl = updateAcl;
/*}}}*/

/*{{{ checkAcl() */
function checkAcl(userid, path, acl, callback){
  getAcl(userid, function (err, data) {
    if (err) {
      callback(err);
    } else {
      if (data.length === 0) {
        var msg = Util.format('userid:\'%s\' | path:\'%s\' | acl: %d', userid, path, acl);
        callback(IError.create('ACL_NOT_PERMITTED',msg));
        return;
      }

      for (var i = 0; i < data.length; i++) {
        if (path.indexOf(data[i].path) === 0 && data[i].useracl & acl) {
          callback.called = true;
          callback();
        }
      }

      if(!callback.called){
        var msg = Util.format('userid:\'%s\' | acl:%d', userid, acl);
        callback(IError.create('ACL_NOT_PERMITTED', msg));
      }
    }
  });
}
exports.checkAcl = checkAcl;
/*}}}*/

/*{{{ getAdmin() */
function getAdmin(path, callback){
  path = Tool.normalize(path);
  var splits = path.split('/');
  var arr = [];
  for (var i = 1; i <= splits.length; i++) {
    arr.push('\'' + Tool.normalize('/' + splits.slice(0,i).join('/')) + '\'');
  }

  var mysql = Factory.getMysql('ui');
  var tbname = Factory.getConfig('ui').find('mysql')['ui']['acl_tbname'];
  var sql = "SELECT path,userid FROM %s WHERE path in (%s) AND useracl in (%s)";

  var aclArr = [];
  aclArr.push(statics['ACL_ADMIN']);
  aclArr.push(statics['ACL_ADMIN'] + statics['ACL_WRITE']);
  aclArr.push(statics['ACL_ADMIN'] + statics['ACL_READ']);
  aclArr.push(statics['ACL_ADMIN'] + statics['ACL_READ'] + statics['ACL_WRITE']);

  sql = Util.format(sql, tbname, arr.join(','), aclArr.join(','));

  Factory.getLog('mysql').notice('GET_ADMIN', sql);
  mysql.query(sql, function (err, data) {
    if (err) {
      var info = Util.format('sql:\'%s\',errmsg:\'%s\'', sql, err.message);
      Factory.getLog('mysql').error('GET_ADMIN', info);
      callback(IError.create('MYSQL_ERROR', err.message));
      return;
    } 

    var admin = '';
    var length = Math.max();
    for (var i = 0; i < data.length; i++) {
      if (data[i].path.length > length) {
        length = data[i].path.length;
        admin = data[i].userid;
      }
    }
    callback(null, admin);

  });
}
exports.getAdmin = getAdmin;
/*}}}*/

/*{{{ addTask() */
/**
 * 添加发布任务
 * @param {String} id 域账号
 * @param {int} version 具体id下的副本版本号
 * @param {Function} callback
 */
function addTask(id, version, token, callback){
  var mysql = Factory.getMysql('ui');

  var tbname = Factory.getConfig('ui').find('mysql')['ui']['taskqueue_tbname'];
  var sql = 'INSERT INTO %s(userid, version, token, addtime) VALUES (\'%s\', %d, \'%s\', now())';
  sql = Util.format(sql, tbname, id, version, token);

  Factory.getLog('mysql').notice('ADD_TASK', sql);
  mysql.query(sql, function (err, rows) {
    if (err) {
      var info = Util.format('sql:\'%s\',errmsg:\'%s\'', sql, err.message);
      Factory.getLog('mysql').error('ADD_TASK', info);
      callback(IError.create('MYSQL_ERROR', err.message));
      return;
    }

    sql = 'SELECT taskid FROM %s WHERE userid = \'%s\' AND version = %d';
    Factory.getLog('mysql').notice('ADD_TASK', sql);
    mysql.query(Util.format(sql, tbname, id, version), function (err, rows) {
      if (err) {
        var info = Util.format('sql:\'%s\',errmsg:\'%s\'', sql, err.message);
        Factory.getLog('mysql').error('ADD_TASK', info);
        callback(IError.create('MYSQL_ERROR', err.message));
        return;
      }
      callback(null, rows[0].taskid);
    });
  });
}
exports.addTask = addTask;
/*}}}*/

/*{{{ updateTaskState() */
/**
 * 更新发布的任务状态
 * @param {int} taskId 任务id
 * @param {int} state 任务状态
 * @param {Function} callback
 */
function updateTaskState(taskId, admin, state, attachment, callback){
  attachment = attachment ? attachment : '';
  var mysql = Factory.getMysql('ui');

  var tbname = Factory.getConfig('ui').find('mysql')['ui']['taskqueue_tbname'];
  var sql = 'UPDATE %s SET state = %d, adminid = \'%s\', checktime = now(), attachment = \'%s\' WHERE taskid = %d';
  sql = Util.format(sql, tbname, state, admin, attachment, taskId);

  Factory.getLog('mysql').notice('UPDATE_TASK_STATE', sql);
  mysql.query(sql, function (err, rows) {
    if (err) {
      var info = Util.format('sql:\'%s\',errmsg:\'%s\'', sql, err.message);
      Factory.getLog('mysql').error('UPDATE_TASK_STATE', info);
      callback(IError.create('MYSQL_ERROR', err.message));
    } else {
      callback(null, rows);
    }
  });
}
exports.updateTaskState = updateTaskState;
/*}}}*/

/*{{{ updateTaskCheck() */
/**
 * 更新task的check事件和负责人id
 * @param {int} taskId 任务id
 * @param {string} adminid 负责人id
 * @param {int} state task状态
 * @param {Function} callback
 */
function updateTaskCheck(taskId, adminid, state, callback){
  var mysql = Factory.getMysql('ui');

  var tbname = Factory.getConfig('ui').find('mysql')['ui']['taskqueue_tbname'];
  var sql = 'UPDATE %s SET checktime = now(), adminid = \'%s\', state = %d WHERE taskid = %d';
  sql = Util.format(sql, tbname, adminid, state, taskId);

  Factory.getLog('mysql').notice('UPDATE_TASK_CHECK', sql);
  mysql.query(sql, function (err, rows) {
    if (err) {
      var info = Util.format('sql:\'%s\',errmsg:\'%s\'', sql, err.message);
      Factory.getLog('mysql').error('UPDATE_TASK_CHECK', info);
      callback(IError.create('MYSQL_ERROR', err.message));
    } else {
      callback(null, rows);
    }
  });
}
exports.updateTaskCheck = updateTaskCheck;
/*}}}*/

/*{{{ getTasks() */
/**
 * 获取任务
 * @param {int} id 用户id
 * @param {Function} callback
 */
function getTasks(id, callback){
  var mysql = Factory.getMysql('ui');

  var tbname = Factory.getConfig('ui').find('mysql')['ui']['taskqueue_tbname'];
  var sql = 'SELECT * FROM %s WHERE userid = \'%s\'';
  sql = Util.format(sql, tbname, id);

  Factory.getLog('mysql').notice('GET_TASKS', sql);
  mysql.query(sql, function (err, rows) {
    if (err) {
      var info = Util.format('sql:\'%s\',errmsg:\'%s\'', sql, err.message);
      Factory.getLog('mysql').error('GET_TASKS', info);
      callback(IError.create('MYSQL_ERROR', err.message));
    } else {
      callback(null, rows);
    }
  });
}
exports.getTasks = getTasks;
/*}}}*/

/*{{{ getTaskById() */
function getTaskById(taskId, callback){
  var mysql = Factory.getMysql('ui');

  var tbname = Factory.getConfig('ui').find('mysql')['ui']['taskqueue_tbname'];
  var sql = 'SELECT * FROM %s WHERE taskid = %d';
  sql = Util.format(sql, tbname, taskId);

  Factory.getLog('mysql').notice('GET_TASK_BY_ID', sql);
  mysql.query(sql, function (err, rows) {
    if (err) {
      var info = Util.format('sql:\'%s\',errmsg:\'%s\'', sql, err.message);
      Factory.getLog('mysql').error('GET_TASK_BY_ID', info);
      callback(IError.create('MYSQL_ERROR', err.message));
    } else {
      callback(null, rows);
    }
  });
}
exports.getTaskById = getTaskById;
/*}}}*/

/*{{{ getSessions() */
/**
 * 获取session信息
 * @param {String} path 配置路径
 * @param {Function} callback
 */
function getSessions(path, callback){
  var mysql = Factory.getMysql('ui');

  var tbname = Factory.getConfig('ui').find('mysql')['ui']['session_tbname'];
  var sql = 'SELECT * FROM %s WHERE path = \'%s\'';
  sql = Util.format(sql, tbname, path);

  Factory.getLog('mysql').notice('GET_SESSIONS', sql);
  mysql.query(sql, function (err, rows) {
    if (err) {
      var info = Util.format('sql:\'%s\',errmsg:\'%s\'', sql, err.message);
      Factory.getLog('mysql').error('GET_SESSIONS', info);
      callback(IError.create('MYSQL_ERROR', err.message));
    } else {
      callback(null, rows);
    }
  });
}
exports.getSessions = getSessions;
/*}}}*/

/*{{{ setSession() */
/**
 * 设置session表
 * @param {String} path 配置路径
 * @param {String} ip   客户端ip
 * @param {int} pid     客户端进程号
 * @param {int} version 客户端持有的配置版本号
 * @param {Function} callback
 */
function setSession(path, ip, pid, version, callback){
  var mysql = Factory.getMysql('ui');

  var tbname = Factory.getConfig('ui').find('mysql')['ui']['session_tbname'];
  var sql = 'INSERT INTO %s(ip, pid, path, path_version, addtime) VALUES (\'%s\', %d, \'%s\', %d, now())';
  sql = Util.format(sql, tbname, ip, pid, path, version);

  Factory.getLog('mysql').notice('SET_SESSIONS', sql);
  mysql.query(sql, function (err, rows) {
    if (err) {
      var info = Util.format('sql:\'%s\',errmsg:\'%s\'', sql, err.message);
      Factory.getLog('mysql').error('SET_SESSION', info);
      callback(IError.create('MYSQL_ERROR', err.message));
    } else {
      callback(null, rows);
    }
  });
}
exports.setSession = setSession;
/*}}}*/

/*{{{ deleteSessions() */
/**
 * 删除sessions
 * @param {String} path 路径
 * @param {function} callback
 */
function deleteSessions(path, callback){
  var mysql = Factory.getMysql('ui');

  var tbname = Factory.getConfig('ui').find('mysql')['ui']['session_tbname'];
  var sql = 'DELETE FROM %s WHERE path = \'%s\'';
  sql = Util.format(sql, tbname, path);

  Factory.getLog('mysql').notice('DELETE_SESSIONS', sql);
  mysql.query(sql, function (err, rows) {
    if (err) {
      var info = Util.format('sql:\'%s\',errmsg:\'%s\'', sql, err.message);
      Factory.getLog('mysql').error('DELETE_SESSIONS', info);
      callback(IError.create('MYSQL_ERROR', err.message));
    } else {
      callback(null, rows);
    }
  });
}
exports.deleteSessions = deleteSessions;
/*}}}*/

