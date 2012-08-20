/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var fs      = require('fs');
var util    = require('util');
var should  = require('should');
var exec    = require('child_process').exec;

var Factory = require('shark').factory;
var config  = require('shark').config.create(__dirname + '/etc/ui.ini');
var svn     = require(__dirname + '/../../app/common/svn.js');
var mysql_wrapper = require(__dirname + '/../../app/ui/wrappers/mysql_wrapper.js');

var config_controller = require(__dirname + '/../../app/ui/controllers/config_controller.js');

var svn_folder;

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

describe('config_tree_test', function() {
  
  /*{{{ beforeEach() */
  beforeEach(function (done) {
    var svnDir  = config.find('svn')['ui']['dir'];
    var svnPath = config.find('svn')['ui']['path'];
    svn_folder = svnDir + '/' + svnPath.split('/').pop();
    deleteDir(function() {
      mkDir();
      done();
    });
  });
  /*}}}*/

  /*{{{ afterEach() */
  afterEach(function (done) {
    deleteDir(function() {
      done();
    });
  });
  /*}}}*/

  /*{{{ should_create_config_tree_works_fine */
  it('should_create_config_tree_works_fine', function (done) {
    var dir = __dirname + '/tmp/config_controller_test';
    var arr = [];
    config_controller.getChildren(dir, '', arr);
    arr[0]['children'][0]['children'][0]['children'][0].id.should.eql('/group2/app1/key1');
    done();
  });
  /*}}}*/

  /*{{{ should_dump_config_svn_works_fine */
  it('should_dump_config_svn_works_fine', function (done) {
    config_controller.getConfigTree(function (err, data) {
      if (err) throw new Error(); 
      data.id.split('/').pop().should.eql('');
      done();
    });
  });
  /*}}}*/

  /*{{{ should_update_config_svn_works_fine */
  it('should_update_config_svn_works_fine', function (done) {
    config_controller.getConfigTree(function (err, data) {
      //write a file
      write(svn_folder + '/testfile', 'blablabla', function (err) {
        //submit the file into svn
        svn.add(svn_folder + '/testfile', function (err) {
          svn.submit(svn_folder, 'test test test test', function(){
            //getConfigTree again to get updated tree
            config_controller.getConfigTree(function (err, data) {
              data.children[0].text.should.eql('testfile');
              done();
            });
          });
        });
      });
    });
  });
  /*}}}*/

});

describe('config_content_test', function() {

  /*{{{ beforeEach() */
  beforeEach(function (done) {
    var mysql = Factory.getMysql('ui');
    var sql = 'DROP TABLE IF EXISTS acl_control';
    mysql.query(sql, function (err, data) {
      
      sql = 'CREATE TABLE `acl_control` (' +
        '`autokid` int(10) unsigned NOT NULL auto_increment,' +
        '`userid` varchar(64) NOT NULL default \'\',' +
        '`path` varchar(1024) NOT NULL default \'\',' +
        '`useracl` int(2) unsigned NOT NULL default 1,' +
        'PRIMARY KEY (`autokid`),' +
        'KEY `idx_userid_path` (`userid`,`path`)' +
        ') ENGINE=InnoDB DEFAULT CHARSET=utf8';

      mysql.query(sql, function (err, data) {
        sql = 
          'INSERT INTO acl_control(userid, path, useracl) VALUES ' + 
          '(\'xx-xx/xx.xx\', \'/testfile\', 1),' + 
          '(\'aa-aa/aa.aa\', \'/testfolder\', 1),' + 
          '(\'yy-yy/yy.yy\', \'/testfile\', 0)';

        mysql.query(sql, function (err, data) {
          var path = config.find('svn')['ui']['dir'] + '/' + config.find('svn')['ui']['path'].split('/').pop();
          fs.mkdirSync(path);
          fs.mkdirSync(path + '/testfolder');
          write(path + '/testfile', 'i am blablabla', function (err) {
            write(path + '/testfolder/testfile2', 'i am another blablabla', function (err) {
              done();
            });
          });
        });
      });
    });
  });
  /*}}}*/

  /*{{{ afterEach() */
  afterEach(function (done) {
    deleteDir(function() {
      done();
    });
  });
  /*}}}*/

  /*{{{ should_get_config_content_succeed_works_fine(user_with_read_right) */
  it('should_get_config_content_succeed_works_fine(user_with_read_right)', function (done) {
    config_controller.getConfigContent('xx-xx/xx.xx', '/testfile', function (err, data) {
      data.should.eql('i am blablabla');
      done();
    });
  });
  /*}}}*/

  /*{{{ should_get_config_content_failed_works_fine(user_without_read_right) */
  it('should_get_config_content_failed_works_fine(user_without_read_right)', function (done) {
    config_controller.getConfigContent('yy-yy/yy.yy', '/testfile', function (err, data) {
      err.message.should.eql('yy-yy/yy.yy has no right to read /testfile');
      done();
    });
  });
  /*}}}*/

  /*{{{ should_get_config_content_failed_works_fine(user_not_exist_in_acl_table) */
  it('should_get_config_content_failed_works_fine(user_not_exist_in_acl_table)', function (done) {
    config_controller.getConfigContent('zz-zz/zz.zz', '/testfile', function (err, data) {
      err.message.should.eql('zz-zz/zz.zz has no right to read /testfile');
      done();
    });
  });
  /*}}}*/

  /*{{{ should_get_config_content_succeed_works_fine(user_parent_has_read_right)*/
  it('should_get_config_content_succeed_works_fine(user_parent_has_read_right)', function (done) {
    config_controller.getConfigContent('aa-aa/aa.aa', '/testfolder/testfile2', function (err, data) {
      data.should.eql('i am another blablabla');
      done();
    });
  });
  /*}}}*/

});

/*{{{ mkDir() */
function mkDir(){
  var tmpDir = __dirname + '/tmp';
  fs.mkdirSync(tmpDir + '/config_controller_test');
  fs.mkdirSync(tmpDir + '/config_controller_test/group1');
  fs.mkdirSync(tmpDir + '/config_controller_test/group2');
  fs.mkdirSync(tmpDir + '/config_controller_test/group2/app1');
  fs.writeFileSync(tmpDir + '/config_controller_test/group2/app1/key1', 'i am value in key1');
}
/*}}}*/

/*{{{ deleteDir() */
function deleteDir(callback){
  exec('cd ' + svn_folder + ' && svn delete * && svn commit -m \'delete all test files\'', function (err, stdout, stderr) {
    var cmd = 'rm -rf ' + __dirname + '/tmp/config_controller_test && rm -rf ' + svn_folder;
    exec(cmd, function (err, stdout, stderr) {
      callback();
    });
  });
}
/*}}}*/

/*{{{ write */
function write(path, content, callback){
  fs.writeFile(path, content, function(err){
    if (err) {
      callback(err);
    } else {
      callback();
    }
  });
}
/*}}}*/

/*{{{ read */
function read(path, callback){
  fs.readFile(path, function (err, data) {
    if (err) {
      callback(err);
    } else {
      callback(null, data.toString());
    }
  });
}
/*}}}*/

