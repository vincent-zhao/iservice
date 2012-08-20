/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var fs      = require('fs');
var util    = require('util');
var should  = require('should');
var exec    = require('child_process').exec;

var Factory = require('shark').factory;
var config  = require('shark').config.create(__dirname + '/etc/ui.ini');
var mysql_wrapper = require(__dirname + '/../../app/ui/wrappers/mysql_wrapper.js');
var svn_wrapper = require(__dirname + '/../../app/ui/wrappers/svn_wrapper.js');

var dup_controller = require(__dirname + '/../../app/ui/controllers/dup_controller.js');

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

describe('dup_operation_test', function (done) {
  
  /*{{{ beforeEach() */
  beforeEach(function (done) {
    cleanUp(function(){
      initEnv(function() {
        fs.mkdirSync(svn_wrapper.getFolder());
        fs.mkdirSync(svn_wrapper.getFolder() + '/app1');
        fs.writeFileSync(svn_wrapper.getFolder() + '/app1/key1','i am value of /app1/key1');
        fs.writeFileSync(svn_wrapper.getFolder() + '/app1/key2','i am value of /app1/key2');
        fs.writeFileSync(svn_wrapper.getFolder() + '/app1/key3','i am value of /app1/key3');
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

  /*{{{ should_get_dups_works_fine*/
  it('should_get_dups_works_fine', function (done) {
    dup_controller.getUserDups('xx-xx/xx.xx', function (err, data) {
      data.length.should.eql(2);
      data[0].content.should.eql('value in /app1/key1');
      done();
    });
  });
  /*}}}*/

  /*{{{ should_create_dup_normal_works_fine */
  it('should_create_dup_normal_works_fine', function (done) {
    //before create
    mysql_wrapper.getDups('xx-xx/xx.xx', function (err, data) {
      data.length.should.eql(2);

      var tbname = Factory.getConfig('ui').find('mysql')['ui']['duplicate_tbname'];
      //there are three records in db, but one of them's state is not EDITING
      Factory.getMysql('ui').query('SELECT * FROM ' + tbname + ' WHERE userid = \'xx-xx/xx.xx\'', function (err, data) {
        data.length.should.eql(3);
        //create
        dup_controller.createDup('xx-xx/xx.xx', '/app1/key3', 'F', function (err, data) {
          //after create
          mysql_wrapper.getDups('xx-xx/xx.xx', function (err, data) {
            data.length.should.eql(3);
            done();
          });
        });
      });
    });
  });
  /*}}}*/

  /*{{{ should_create_with_no_right_fail_works_fine */
  it('should_create_with_no_right_fail_works_fine', function (done) {
    dup_controller.createDup('yy-yy/yy.yy', '/app1/key3', 'F', function (err, data) {
      if (err) {
        err.name.should.eql('ACL_WRITE_NOT_PERMITTED');
        done();
      }
    });
  });
  /*}}}*/

  /*{{{ should_create_with_exist_dup_fail_works_fine */
  it('should_create_with_exist_dup_fail_works_fine', function (done) {
    dup_controller.createDup('xx-xx/xx.xx', '/app1/key2', 'F', function (err, data) {
      if (err) {
        err.name.should.eql('PATH_DUP_EXISTS');
        done();
      }
    });
  });
  /*}}}*/

  /*{{{ should_save_dup_works_fine */
  it('should_save_dup_works_fine', function (done) {
    var newContent = 'i am new value';
    dup_controller.saveDup('xx-xx/xx.xx', '/app1/key1', newContent, function (err) {
      mysql_wrapper.getDups('xx-xx/xx.xx', function (err, data) {
        for (var i = 0; i < data.length; i++) {
          if (data[i].path === '/app1/key1') {
            data[i].content.should.eql(newContent);
            done();
          }
        }
      });
    });
  });
  /*}}}*/

  /*{{{ should_delete_dup_works_fine */
  it('should_delete_dup_works_fine', function (done) {
    dup_controller.deleteDup('xx-xx/xx.xx','/app1/key1', function (err) {
      var tbname = Factory.getConfig('ui').find('mysql')['ui']['duplicate_tbname'];
      Factory.getMysql('ui').query('SELECT * FROM ' + tbname + ' WHERE userid = \'xx-xx/xx.xx\'', function (err, data) {
        data.length.should.eql(2);
        data[0].state.should.eql(1);
        done();
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

  var sql3 = 'INSERT INTO duplicates(userid,path,content,origin_md5,addtime,modtime,version, state) VALUES ' +
  '(\'xx-xx/xx.xx\',\'/app1/key1\',\'value in /app1/key1\',\'123456\',\'2012-08-14\',\'2012-08-15\', 1, 0),' +
  '(\'xx-xx/xx.xx\',\'/app1/key1\',\'value in /app1/key1\',\'123456\',\'2012-08-14\',\'2012-08-15\', 1, 1),' +
  '(\'xx-xx/xx.xx\',\'/app1/key2\',\'value in /app1/key2\',\'123456\',\'2012-08-13\',\'2012-08-15\', 1, 0)';

  var sql4 = 'DROP TABLE IF EXISTS acl_control';
  var sql5 = 'CREATE TABLE `acl_control` (' +
  '`autokid` int(10) unsigned NOT NULL auto_increment,' +
  '`userid` varchar(64) NOT NULL default \'\',' +
  '`path` varchar(1024) NOT NULL default \'\',' +
  '`useracl` int(2) unsigned NOT NULL default 1,' +
  'PRIMARY KEY (`autokid`),' +
  'KEY `idx_userid_path` (`userid`,`path`)' +
  ') ENGINE=InnoDB DEFAULT CHARSET=utf8';

  var sql6 = 'INSERT INTO acl_control(userid, path, useracl) VALUES ' + 
  '(\'xx-xx/xx.xx\', \'/app1\', 3)'; 

  var arr1 = [sql1, sql4];
  var arr2 = [sql2, sql5];
  var arr3 = [sql3, sql6];

  queryGroup(arr1, function(){
    queryGroup(arr2, function(){
      queryGroup(arr3, function(){
        callback();
      });
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

