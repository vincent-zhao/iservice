/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */
/**
 * @author yixuan
 */

function send(taskId, token, admin, callback){
  console.log('http://127.0.0.1:4321/submit/taskreply/' + taskId + '/' + encodeURIComponent(admin) + '/' + token + '/reject');
  console.log('http://127.0.0.1:4321/submit/taskreply/' + taskId + '/' + encodeURIComponent(admin) + '/' + token + '/adopt');
  callback();
}
exports.send = send;

