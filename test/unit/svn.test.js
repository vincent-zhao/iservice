var should = require('should');
var fs = require('fs');
var exec = require('child_process').exec;
var svn = require(__dirname + '/../../app/common/svn.js');

var config  = require('shark').config.create(__dirname + '/etc/ui.ini').find('svn')['ui'];

describe('svn interface test' ,function(){

  /*{{{ before() */
  before(function (done) {
    exec('svn delete ' + config.dir + '/' + config.path.split('/').pop() + '/* && svn commit -m \'delete all test files\'', function (err, stdout, stderr) {
      done();
    });
  });
  /*}}}*/

  /*{{{ after() */
  after(function (done) {
    deleteDir(config.dir + '/' + config.path.split('/').pop(), function(){
      done();
    });
  });
  /*}}}*/

  /*{{{ should_add_submit_and_dump_works_fine */
  it('should_add_submit_and_dump_works_fine', function (done) {
    //dump first
    svn.dump(config.dir, config.path, function (err, stdout) {
      var filePath = config.dir + '/' + config.path.split('/').pop() + '/testfile';
      //then write new file
      write(filePath, 'i am test file', function (err) {
        //add new file into svn
        svn.add(filePath, function (err) {
          svn.submit(config.dir + '/' + config.path.split('/').pop(), 'testfile added into testfolder', function(){
            var checkFolder = config.dir + '/checkfolder';
            fs.mkdirSync(checkFolder);
            //dump new version
            svn.dump(checkFolder, config.path, function (err, stdout) {
              //read whether new file exists
              read(checkFolder + '/' + config.path.split('/').pop() + '/testfile', function (err, data) {
                'i am test file'.should.eql(data);
                //delete new file
                svn.delete_(filePath, 'testfile is deleted', function (err) {
                  //read whether new file is deleted
                  read(filePath, function(err){
                    if (err) {
                      deleteDir(checkFolder, function(){
                        done();
                      });
                    }
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

  /*{{{ should_update_works_fine */
  it('should_update_works_fine', function (done) {
    //dump first
    svn.dump(config.dir, config.path, function (err, stdout) {
      var filePath = config.dir + '/' + config.path.split('/').pop() + '/testfile';
      //then write new file
      write(filePath, 'i am test file', function (err) {
        //add new file into svn
        svn.add(filePath, function (err) {
          svn.submit(config.dir + '/' + config.path.split('/').pop(), 'testestestestestestest', function(){
            svn.update(config.dir + '/' + config.path.split('/').pop(), function (err, version) {
              if (/\d+/.test(version)) {
                done();
              }
            });
          });
        });
      });
    });
  });
  /*}}}*/

});

/*{{{ deleteDir */
function deleteDir(path, callback){
  var command = 'rm -rf ' + path;
  exec(command, function (err, stdout, stderr) {
    if (err || stderr) {
      throw new Error('error in after');
    } else {
      callback();
    }
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

