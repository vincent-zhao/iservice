/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */
/**
 * @author yixuan
 */

var fs = require('fs');
var Tool = require(__dirname + '/../../common/tool.js');
var IError = require(__dirname + '/../../common/ierror.js');
var svn_wrapper = require(__dirname + '/../wrappers/svn_wrapper.js');
var mysql_wrapper = require(__dirname + '/../wrappers/mysql_wrapper.js');

/*{{{ getConfigTree() */
function getConfigTree(callback){
  svn_wrapper.update(function (err) {
    if (err) {
      callback(err);
    } else {
      var arr = [];
      getChildren(svn_wrapper.getFolder(), '', arr);
      callback(null, arr[0]);
    }
  });
}
exports.getConfigTree = getConfigTree;
/*}}}*/

/*{{{ getChildren() */
/**
 * 获取config树
 */
function getChildren(path, relative, arr){
  path = Tool.normalize(path);
  var fileName = path.split('/').pop();
  var state = fs.statSync(path);
  if (state.isDirectory() && !(/^.svn$/.test(fileName))) {
    var childrenArr = [];
    arr.push({
      text : fileName,
      id : relative,
      expanded : false,
      children : childrenArr 
    });
    
    var files = fs.readdirSync(path);
    for (var i = 0; i < files.length; i++) {
      getChildren(path + '/' + files[i], relative + '/' + files[i], childrenArr);
    }

  } else if (state.isFile()) {
    arr.push({
      text : fileName,
      id : relative,
      leaf : true
    });
  }
}
exports.getChildren = getChildren;
/*}}}*/

/*{{{ getConfigContent() */
/**
 * 获取配置内容
 */
function getConfigContent(userid, path, callback){
  mysql_wrapper.checkAcl(userid, path, mysql_wrapper.statics['ACL_READ'], function (err) {
    if (err) {
      callback(IError.create('ACL_READ_NOT_PERMITTED', userid + ' has no right to read ' + path));
    } else {
      svn_wrapper.readFile(path, 'F', callback);
    }
  });
}
exports.getConfigContent = getConfigContent;
/*}}}*/

