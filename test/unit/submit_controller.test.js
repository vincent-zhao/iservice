/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var fs      = require('fs');
var util    = require('util');
var should  = require('should');
var exec    = require('child_process').exec;

var Factory = require('shark').factory;
var config  = require('shark').config.create(__dirname + '/etc/ui.ini');
var mysql_wrapper = require(__dirname + '/../../app/ui/wrappers/mysql_wrapper.js');
var svn_wrapper = require(__dirname + '/../../app/ui/wrappers/svn_wrapper.js');

var submit_controller = require(__dirname + '/../../app/ui/controllers/submit_controller');

/*{{{ beforeEach() */
beforeEach(function (done) {
  Factory.cleanAll();
  Factory.setConfig('ui', config);
  var _confs  = config.find('mysql');
  for (var i in _confs) {
    Factory.setMysql(i, _confs[i]);
  }
  done();
});
/*}}}*/

describe('submit_controller_test', function(){

  /*{{{ beforeEach() */
  beforeEach(function (done) {
    cleanUp(function(){
      initEnv(function() {
        fs.mkdirSync(svn_wrapper.getFolder());
        fs.mkdirSync(svn_wrapper.getFolder() + '/app1');
        fs.writeFileSync(svn_wrapper.getFolder() + '/app1/key1','i am new value of /app1/key1');
        fs.writeFileSync(svn_wrapper.getFolder() + '/app1/key2','i am new value of /app1/key2');
        done();
      });
    });
  });
  /*}}}*/

  /*{{{ afterEach() */
  afterEach(function (done) {
    cleanUp(function(){
      done();
    });
  });
  /*}}}*/

  /*{{{ should_test_checkmd5_all_file_md5_matched_works_fine */
  it('should_test_checkmd5_all_file_md5_matched_works_fine', function (done) {
    mysql_wrapper.addDup('xx-xx/xx.xx', '/app1/key1', 'F', 'i am new value of /app1/key1', function (err) {
      mysql_wrapper.addDup('xx-xx/xx.xx', '/app1/key2', 'F', 'i am new value of /app1/key2', function (err) {
        mysql_wrapper.getDups('xx-xx/xx.xx', function (err, data) {
          submit_controller.checkMd5(data, function (err) {
            if (err) {
              throw new Error();
            } else {
              done();
            }
          });
        });
      });
    });
  });
  /*}}}*/

  /*{{{ should_test_checkmd5_file_changed_md5_not_matched_works_fine */
  it('should_test_checkmd5_file_changed_md5_not_matched_works_fine', function (done) {
    mysql_wrapper.addDup('xx-xx/xx.xx', '/app1/key1', 'F', 'i am new value of /app1/key1', function (err) {
      mysql_wrapper.addDup('xx-xx/xx.xx', '/app1/key2', 'F', 'i am old value of /app1/key2', function (err) {
        mysql_wrapper.getDups('xx-xx/xx.xx', function (err, data) {
          submit_controller.checkMd5(data, function (err) {
            if (err) {
              err.name.should.eql('FILE_CHANGED');
              done();
            } 
          });
        });
      });
    });
  });
  /*}}}*/

  /*{{{ should_test_checkAdmin_same_admin_works_fine */
  it('should_test_checkAdmin_same_admin_works_fine', function (done) {
    mysql_wrapper.addAcl('xx-xx/xx.xx', '/app1', 4, function (err) {
      mysql_wrapper.addAcl('xx-xx/xx.xx', '/app2', 4, function (err) {
        var dups = [
          {path : '/app1/key1'},
          {path : '/app2/key1'},
        ];
        submit_controller.checkAdmin(dups, function (err) {
          if (err) {
            throw new Error();
          } else {
            done();
          }
        });
      });
    });
  });
  /*}}}*/

  /*{{{ should_test_checkAdmin_not_same_admin_works_fine */
  it('should_test_checkAdmin_not_same_admin_works_fine', function (done) {
    mysql_wrapper.addAcl('xx-xx/xx.xx', '/app1', 4, function (err) {
      mysql_wrapper.addAcl('yy-yy/yy.yy', '/app2', 4, function (err) {
        var dups = [
          {path : '/app1/key1'},
          {path : '/app2/key1'},
        ];
        submit_controller.checkAdmin(dups, function (err) {
          if (err) {
            err.name.should.eql('NOT_SAME_ADMIN');
            done();
          }
        });
      });
    });
  });
  /*}}}*/

});

/*{{{ initEnv() */
function initEnv(callback){
  var sql1 = 'DROP TABLE IF EXISTS duplicates';
  var sql2 = 'CREATE TABLE `duplicates` (' +
  '`autokid` int(10) unsigned NOT NULL auto_increment,' +
  '`userid` varchar(64) NOT NULL default \'\',' +
  '`path` varchar(1024) NOT NULL default \'\',' +
  '`node_type` char(1) NOT NULL default \'F\',' +
  '`content` MEDIUMTEXT NOT NULL default \'\',' +
  '`origin_md5` varchar(64) NOT NULL default \'\',' +
  '`addtime` DATETIME NOT NULL default \'0000-00-00 00:00:00\',' +
  '`modtime` DATETIME NOT NULL default \'0000-00-00 00:00:00\',' +
  '`version` int(10) unsigned NOT NULL default 0,`state` int(2) unsigned NOT NULL default 0,' +
  'PRIMARY KEY  (`autokid`),' +
  'KEY `idx_userid` (`userid`),' +
  'KEY `idx_userid_path` (`userid`,`path`)' +
  ') ENGINE=InnoDB DEFAULT CHARSET=utf8';

  var sql3 = 'DROP TABLE IF EXISTS acl_control';
  var sql4 = 'CREATE TABLE `acl_control` (' +
  '`autokid` int(10) unsigned NOT NULL auto_increment,' +
  '`userid` varchar(64) NOT NULL default \'\',' +
  '`path` varchar(1024) NOT NULL default \'\',' +
  '`useracl` int(2) unsigned NOT NULL default 1,' +
  'PRIMARY KEY (`autokid`),' +
  'KEY `idx_userid_path` (`userid`,`path`)' +
  ') ENGINE=InnoDB DEFAULT CHARSET=utf8';

  var arr1 = [sql1, sql3];
  var arr2 = [sql2, sql4];

  queryGroup(arr1, function(){
    queryGroup(arr2, function(){
      callback();
    });
  });
}
/*}}}*/

/*{{{ queryGroup() */
function queryGroup(arr, callback){
  var mysql = Factory.getMysql('ui');

  var count = arr.length;
  arr.forEach(function (sql) {
    mysql.query(sql, function (err, data) {
      if (--count === 0) {
        callback();
      }
    });
  });
}
/*}}}*/

/*{{{ cleanUp() */
function cleanUp(callback){
  exec('rm -rf ' + svn_wrapper.getFolder(), function (err, stdout, stderr) {
    callback();
  });
}
/*}}}*/

