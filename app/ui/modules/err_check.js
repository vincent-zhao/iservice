/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */
/**
 * 检查是否屏蔽
 * @author yixuan
 */

var tags = ['SVN_ERROR','MYSQL_ERROR'];

exports.check = function (err) {
  for (var i = 0; i < tags.length; i++) {
    if (err.name === tags[i]) {
      return true;
    }
  }
  return false;
}

