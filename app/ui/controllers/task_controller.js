/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */
/**
 * @author yixuan
 */

var mysql_wrapper = require(__dirname + '/../wrappers/mysql_wrapper.js');
var Tool = require(__dirname + '/../../common/tool.js');

var map;

/*{{{ getTasks() */
function getTasks(id, callback){
  mysql_wrapper.getTasks(id, function (err, data) {
    if (err) {
      callback(err);

    } else {
      initMap();
      for (var i = 0; i < data.length; i++) {
        data[i].state = map[data[i].state.toString()];
        data[i].addtime = Tool.dateFormat(data[i].addtime);
        data[i].checktime = Tool.dateFormat(data[i].checktime);
      }
      callback(null, data);
    }
  });
}
exports.getTasks = getTasks;
/*}}}*/

/*{{{ getTaskDups() */
function getTaskDups(id, version, callback){
  mysql_wrapper.getDupsByVersion(id, version, function (err, data) {
    if (err) {
      callback(err);
    } else {
      for (var i = 0; i < data.length; i++) {
        data[i].modtime = Tool.dateFormat(data[i].modtime);
      }
      callback(null, data);
    }
  });
}
exports.getTaskDups = getTaskDups;
/*}}}*/

/*{{{ initMap() */
function initMap(){
  if (!map) {
    map =  {};
    for (var i in mysql_wrapper.statics) {
      if (/^TASK_/.test(i)) {
        map[mysql_wrapper.statics[i].toString()] = i.substr(5);
      }
    }
  }
}
/*}}}*/

