/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var should  = require('should');
var Factory = require('shark').factory;
Factory.cleanAll();
var mysql_wrapper = require(__dirname + '/../../app/ui/wrappers/mysql_wrapper.js');

/*{{{ beforeEach() */
beforeEach(function (done) {
  var config  = require('shark').config.create(__dirname + '/etc/ui.ini');
  Factory.setConfig('ui', config);

  var _confs  = config.find('mysql');
  for (var i in _confs) {
    Factory.setMysql(i, _confs[i]);
  }

  var _confs  = config.find('log');
  for (var i in _confs) {
    Factory.setLog(i, _confs[i]);
  }

  deleteTables(function(){
    createTables(function(){
      done();
    });
  });
});
/*}}}*/

describe('duplicate_operators', function() {

  /*{{{ should_add_and_get_duplicate_works_fine */
  it('should_add_and_get_duplicate_works_fine', function (done) {
    var fakeId = 'xxx-xx/xx.xx';
    var fakePath = '/root/fortest';
    var fakeContent = 'i am test content';
    mysql_wrapper.addDup(fakeId, fakePath, 'F', fakeContent, function (err) {
      mysql_wrapper.getDups(fakeId, function (err, data) {
        if (err) throw err;

        data[0].version.should.eql(1);
        data[0].path.should.eql(fakePath);
        data[0].content.should.eql(fakeContent);
        data[0].addtime.toString().should.eql(data[0].modtime.toString());
        done();
      });
    });
  });
  /*}}}*/

  /*{{{ should_update_and_delete_works_fine*/
  it('should_update_and_delete_works_fine', function (done) {
    var fakeId = 'xxx-xx/xx.xx';
    var fakePath = '/root/fortest';
    var fakeContent = 'i am test content';
    mysql_wrapper.addDup(fakeId, fakePath, 'F', 'blablabla', function (err) {
      //timeout for comparison between addtime and modtime
      setTimeout(function(){
        //test update
        mysql_wrapper.updateDupContent(fakeId, fakePath, fakeContent, function (err) {
          mysql_wrapper.getDups(fakeId, function (err, data) {
            if (err) throw err;

            data[0].path.should.eql(fakePath);
            data[0].content.should.eql(fakeContent);
            data[0].modtime.toString().should.not.eql(data[0].addtime.toString());

            //test delete
            mysql_wrapper.deleteDup(fakeId, fakePath, function (err) {
              mysql_wrapper.getDups(fakeId, function (err, data) {
                if (err) throw err;
                data.length.should.eql(0);
                done();
              });
            });

          });
        });
      },2000);
    });
  });
  /*}}}*/

  /*{{{ should_update_state_works_fine_and_cannot_get_and_delete_duplicate_with_other_states(not editing) */
  it('should_update_state_works_fine_and_cannot_get_and_delete_duplicate_with_other_states(not editing)', function (done) {
    var fakeId = 'xxx-xx/xx.xx';
    var fakePath = '/root/fortest';
    var fakeMd5 = 'fakemd5';
    //add dup
    mysql_wrapper.addDup(fakeId, fakePath, 'F', fakeMd5, function (err) {
      //set state not editing
      mysql_wrapper.updateDupsState(fakeId, 1, 2, function (err) {
        //get no dup
        mysql_wrapper.getDups(fakeId, function (err, data) {

          data.length.should.eql(0);

          //cannot delete dup
          mysql_wrapper.deleteDup(fakeId, fakePath, function (err) {
            //set state to editing
            mysql_wrapper.updateDupsState(fakeId, 1, 0, function (err) {
              //can get the dup
              mysql_wrapper.getDups(fakeId, function (err, data) {
                data.length.should.eql(1);

                //can delete dup
                mysql_wrapper.deleteDup(fakeId, fakePath, function (err) {
                  mysql_wrapper.getDups(fakeId, function (err, data) {
                    if (err) throw err;
                    data.length.should.eql(0);
                    done();
                  });
                });

              });
            });
          });
        });
      });
    });
  });
  /*}}}*/

  /*{{{ should_add_duplicate_version_auto_increment_works_fine */
  it('should_add_duplicate_version_auto_increment_works_fine', function (done) {
    var fakeId = 'xxx-xx/xx.xx';
    var fakePath = '/root/fortest';
    var fakeMd5 = 'fakemd5';
    //add dup
    mysql_wrapper.addDup(fakeId, fakePath, 'F', fakeMd5, function (err) {
      //set state not editing
      mysql_wrapper.updateDupsState(fakeId, 1, 2, function (err) {
        //add another
        mysql_wrapper.addDup(fakeId, fakePath, 'F', fakeMd5, function (err) {
          mysql_wrapper.getDups(fakeId, function (err, data) {
            data.length.should.eql(1);
            data[0].version.should.eql(2);
            done();
          });
        });
      });
    });
  });
  /*}}}*/

  /*{{{ should_add_duplicate_version_is_the_same_as_exist_duplicate */
  it('should_add_duplicate_version_is_the_same_as_exist_duplicate', function (done) {
    var fakeId = 'xxx-xx/xx.xx';
    var fakePath = '/root/fortest2';
    var fakeMd5 = 'fakemd5';
    //add dup
    mysql_wrapper.addDup(fakeId, fakePath, 'F', fakeMd5, function (err) {
      //add another
      mysql_wrapper.addDup(fakeId, fakePath, 'F', fakeMd5, function (err) {
        mysql_wrapper.getDups(fakeId, function (err, data) {
          data.length.should.eql(2);
          data[0].version.should.eql(1);
          done();
        });
      });
    });
  });
  /*}}}*/

  /*{{{ should_check_dup_state_all_ok_works_fine */
  it('should_check_dup_state_ok_works_fine', function (done) {
    var mysql = Factory.getMysql('ui');
    mysql.query('INSERT INTO duplicates(userid, path, state) VALUES (\'abcdefg\', \'/a/b/c/d\', 2)', function (err, data) {
      mysql_wrapper.checkDupState('/a/b/c/d', [1,2,3], function (err, data) {
        data.length.should.eql(1);
        data[0].path.should.eql('/a/b/c/d');
        done();
      });
    });
  });
  /*}}}*/

  /*{{{ should_check_dups_state_fail_works_fine */
  it('should_check_dups_state_fail_works_fine', function (done) {
    var mysql = Factory.getMysql('ui');
    mysql.query('INSERT INTO duplicates(userid, path, state) VALUES (\'abcdefg\', \'/a/b/c/d\', 2)', function (err, data) {
      mysql_wrapper.checkDupState('/a/b/c/d', [1,3], function (err, data) {
        data.length.should.eql(0);
        done();
      });
    });
  });
  /*}}}*/

});

describe('acl_operators', function() {

  /*{{{ should_add_get_and_update_acl_works_fine */
  it('should_add_and_get_acl_works_fine', function (done) {
    var fakeId = 'xxx-xx/xx.xx';
    var fakePath = '/root/fortest';
    var fakeMode = 7;
    mysql_wrapper.addAcl(fakeId, fakePath, fakeMode, function (err) {
      mysql_wrapper.getAcl(fakeId, function (err, data) {
        data[0].useracl.should.eql(fakeMode);
        data[0].path.should.eql(fakePath);

        //update acl
        mysql_wrapper.updateAcl(fakeId, fakePath, 1, function (err) {
          mysql_wrapper.getAcl(fakeId, function (err, data) {
            data[0].useracl.should.eql(1);
            data[0].path.should.eql(fakePath);
            done();
          });
        });
      });
    });
  });
  /*}}}*/

  /*{{{ should_checkacl_works_fine */
  it('should_checkacl_works_fine', function (done) {
    var fakeId = 'xxx-xx/xx.xx';
    var fakePath = '/root/fortest';
    var fakeMode = 1;
    mysql_wrapper.addAcl(fakeId, '/root', fakeMode, function (err) {
      mysql_wrapper.checkAcl(fakeId, fakePath, mysql_wrapper.statics['ACL_READ'], function (err, data) {
        if (err) {
        console.log(err);
          throw new Error();
        } else {
          done();
        }
      });
    });
  });
  /*}}}*/

  /*{{{ should_get_admin_works_fine */
  it('should_get_admin_works_fine', function (done) {
    var fakeId = 'xx-xx/xx.xx';
    var fakeId2 = 'yy-yy/yy.yy';
    var fakePath = '/root/fortest/test';
    mysql_wrapper.addAcl(fakeId, '/root', 7, function (err) {
      mysql_wrapper.addAcl(fakeId2, '/root/fortest', 4, function (err) {
        mysql_wrapper.getAdmin(fakePath, function (err, admin) {
          admin.should.eql(fakeId2);
          done();
        });
      });
    });
  });
  /*}}}*/

});

describe('taskqueue_operators', function() {
  
  /*{{{ should_add_get_and_update_task_state_works_fine */
  it('should_add_get_and_update_task_state_works_fine', function (done) {
    var fakeId = 'xxx-xx/xx.xx';
    var fakeVersion = 10;
    mysql_wrapper.addTask(fakeId, fakeVersion, 'abcdefg', function (err, data) {
      data.should.eql(1);

      mysql_wrapper.getTasks(fakeId, function (err, data) {
        data[0].userid.should.eql(fakeId);
        data[0].state.should.eql(0);

        //update state of task
        mysql_wrapper.updateTaskState(data[0].taskid, 'yyy-yy/yy.yy', 2, 'introduction', function (err, data) {
          mysql_wrapper.getTasks(fakeId, function (err, data) {
            data[0].userid.should.eql(fakeId);
            data[0].state.should.eql(2);
            data[0].adminid.should.eql('yyy-yy/yy.yy');
            data[0].attachment.should.eql('introduction');
            done();
          });
        });
      });
    });
  });
  /*}}}*/

  /*{{{ should_add_get_and_update_task_check_works_fine */
  it('should_add_get_and_update_task_check_works_fine', function (done) {
    var fakeId = 'xxx-xx/xx.xx';
    var fakeAdminId = 'yyy-yy/yy.yy';
    var fakeVersion = 10;
    mysql_wrapper.addTask(fakeId, fakeVersion, 'abcdefg', function (err) {
      mysql_wrapper.getTasks(fakeId, function (err, data) {
        data[0].userid.should.eql(fakeId);
        data[0].state.should.eql(0);

        //update state of task
        mysql_wrapper.updateTaskCheck(data[0].taskid, fakeAdminId, 100, function (err, data) {
          mysql_wrapper.getTasks(fakeId, function (err, data) {
            data[0].userid.should.eql(fakeId);
            data[0].adminid.should.eql(fakeAdminId);
            data[0].checktime.toString().length.should.eql(data[0].addtime.toString().length);
            done();
          });
        });
      });
    });
  });
  /*}}}*/

});


describe('session_operators', function() {
  
  /*{{{ should_set_get_delete_session_works_fine */
  it('should_set_get_delete_session_works_fine', function (done) {
    var fakePath = '/root/fortest';
    var fakeIp = '0.0.0.0';
    var fakePid = 1000;
    var fakeVersion = 100;
    mysql_wrapper.setSession(fakePath, fakeIp, fakePid, fakeVersion, function (err) {
      mysql_wrapper.getSessions(fakePath, function (err, data) {
        data[0].path.should.eql(fakePath);
        data[0].ip.should.eql(fakeIp);
        data[0].pid.should.eql(fakePid);
        data[0].path_version.should.eql(fakeVersion);

        mysql_wrapper.deleteSessions(fakePath, function (err) {
          mysql_wrapper.getSessions(fakePath, function (err, data) {
            data.length.should.eql(0);
            done();
          });
        });

      });
    });
  });
  /*}}}*/

});

/*{{{ createTables() */
function createTables(callback){
  var sql1 = 
    'CREATE TABLE `duplicates` (' +
    '`autokid` int(10) unsigned NOT NULL auto_increment,' +
    '`userid` varchar(64) NOT NULL default \'\',' +
    '`path` varchar(1024) NOT NULL default \'\',' +
    '`node_type` char(1) NOT NULL default \'F\',' +
    '`content` MEDIUMTEXT NOT NULL default \'\',' +
    '`origin_md5` varchar(64) NOT NULL default \'\',' +
    '`addtime` DATETIME NOT NULL default \'0000-00-00 00:00:00\',' +
    '`modtime` DATETIME NOT NULL default \'0000-00-00 00:00:00\',' +
    '`version` int(10) unsigned NOT NULL default 0,' +
    '`state` int(2) unsigned NOT NULL default 0,' +
    'PRIMARY KEY  (`autokid`),' +
    'KEY `idx_userid` (`userid`),' +
    'KEY `idx_userid_path` (`userid`,`path`)' +
    ') ENGINE=InnoDB DEFAULT CHARSET=utf8';

  var sql2 = 
    'CREATE TABLE `acl_control` (' +
    '`autokid` int(10) unsigned NOT NULL auto_increment,' +
    '`userid` varchar(64) NOT NULL default \'\',' +
    '`path` varchar(1024) NOT NULL default \'\',' +
    '`useracl` int(2) unsigned NOT NULL default 1,' +
    'PRIMARY KEY (`autokid`),' +
    'KEY `idx_userid_path` (`userid`,`path`)' +
    ') ENGINE=InnoDB DEFAULT CHARSET=utf8';

  var sql3 = 
    'CREATE TABLE `task_queue` (' +
    '`taskid` int(10) unsigned NOT NULL auto_increment,' +
    '`userid` varchar(64) NOT NULL default \'\',' +
    '`version` int(10) unsigned NOT NULL default 0,' +
    '`state` tinyint(1) unsigned NOT NULL default 0,' +
    '`addtime` DATETIME NOT NULL default \'0000-00-00 00:00:00\',' +
    '`checktime` DATETIME NOT NULL default \'0000-00-00 00:00:00\',' +
    '`adminid` varchar(64) NOT NULL default \'\',' +
    '`token` varchar(64) NOT NULL default \'\',' +
    '`attachment` varchar(1024) NOT NULL default \'\',' +
    'PRIMARY KEY (`taskid`),' +
    'KEY `idx_userid` (`userid`)' +
    ') ENGINE=InnoDB DEFAULT CHARSET=utf8';

  var sql4 = 
    'CREATE TABLE `client_session` (' +
    '`autokid` int(10) unsigned NOT NULL auto_increment,' +
    '`ip` varchar(16) NOT NULL default \'000.000.000.000\',' +
    '`pid` int(5) NOT NULL default 0,' +
    '`path` varchar(1024) NOT NULL default \'\',' +
    '`path_version` int(10) NOT NULL default 0,' +
    '`addtime` DATETIME NOT NULL default \'0000-00-00 00:00:00\',' +
    'PRIMARY KEY  (`autokid`),' +
    'KEY `idx_path` (`path`)' +
    ') ENGINE=InnoDB DEFAULT CHARSET=utf8';

  var arr = [];
  arr.push(sql1);
  arr.push(sql2);
  arr.push(sql3);
  arr.push(sql4);

  var mysql = Factory.getMysql('ui');
  var count = arr.length;
  for (var i = 0; i < arr.length; i++) {
    mysql.query(arr[i], function (err, data) {
      if (err) {
        throw new Error(err);
      } else {
        if (--count === 0) {
          callback();
        }
      }
    });
  }
}
/*}}}*/

/*{{{ deleteTables() */
function deleteTables(callback){
  var sql1 = 'DROP TABLE IF EXISTS duplicates';
  var sql2 = 'DROP TABLE IF EXISTS acl_control';
  var sql3 = 'DROP TABLE IF EXISTS task_queue';
  var sql4 = 'DROP TABLE IF EXISTS client_session';

  var arr = [sql1, sql2, sql3, sql4];

  var count = arr.length;
  var mysql = Factory.getMysql('ui');
  for (var i = 0; i < arr.length; i++) {
    mysql.query(arr[i], function (err, data) {
      if (err) {
        throw new Error(err);
      } else {
        if (--count === 0) {
          callback();
        }
      }
    });
  }
}
/*}}}*/

