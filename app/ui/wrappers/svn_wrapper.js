var fs = require('fs');
var exec = require('child_process').exec;
var IError = require(__dirname + '/../../common/ierror.js');
var svn = require(__dirname + '/../../common/svn.js');
var Tool = require(__dirname + '/../../common/tool.js');
var Factory = require('shark').factory;

/*{{{ getFolder() */
function getFolder(){
  var uiConf = Factory.getConfig('ui').find('svn')['ui'];
  var root   = uiConf['dir'];
  var path   = uiConf['path'];
  return root + '/' + Tool.normalize(path).split('/').pop();
}
exports.getFolder = getFolder;
/*}}}*/

/*{{{ readFile() */
function readFile(path, type, callback){
  if (type === 'D') {
    callback(null, '');
    return;
  }
  svn.update(getFolder(), function (err) {
    if (err) {
      Factory.getLog('svn').error('SVN_ERROR', err.message);
      callback(err);
      return;
    }

    path = Tool.normalize(path);
    try {
      if (isDir(path)) {
        callback(IError.create('NOT_CONFIG', path + ' is not leaf node'));
        return;
      }
    } catch(e) {
      callback(null, '');
      return;
    }

    fs.readFile(getFolder() + path, function (err, data) {
      if (err) {
        callback(IError.create('FS', err.message));
      } else {
        callback(null, data.toString());
      }
    });
  });
}
exports.readFile = readFile;
/*}}}*/

/*{{{ writeFile() */
function writeFile(path, content, type, callback){
  path = Tool.normalize(path);
  try {
    if (isDir(path)) {
      callback();
      return;
    }

  } catch(e) {
    path = path.substr(1);
    var splits = path.split('/');
    var folderArr = [];

    var testPath;
    while (true) {
      testPath = getFolder() + Tool.normalize(splits.join('/'));
      try {
        fs.statSync(testPath);
        break;
      } catch(e) {
        folderArr.push(testPath)
        splits.pop();
        continue;
      }
    }

    var save = folderArr[folderArr.length - 1];
    try {
      while (folderArr.length > 1) {
        fs.mkdirSync(folderArr.pop());
      }

      if (type === 'D') {
        fs.mkdirSync(getFolder() + '/' + path);
      } else {
        fs.writeFileSync(getFolder() + '/' + path, content);
      }
      svn.add(save, function (err) {
        if (err) {
          Factory.getLog('svn').error('SVN_ERROR', err.message);
          callback(err);
        } else {
          callback();
        }
      });
    } catch(e) {
      exec('rm -rf ' + save, function (err, stdout, stderr) {
        callback();
      });
    }
    return;
  }

  fs.writeFileSync(getFolder() + path, content);
  callback();
}
exports.writeFile = writeFile;
/*}}}*/

/*{{{ update() */
function update(path, callback){
  if (typeof path === 'function') {
    callback = path;
    path = '';
  }
  
  try {
    fs.statSync(getFolder() + path);
    svn.update(getFolder() + path, function (err, version) {
      if (err) {
        Factory.getLog('svn').error('SVN_ERROR', err.message);
        callback(err);
      } else {
        callback(null, version);
      }
    });
  } catch(e) {
    var p = Tool.normalize(getFolder() + path).split('/');
    p.pop();
    p = Tool.normalize(p.join('/'));

    var src = Factory.getConfig('ui').find('svn')['ui']['path'] + Tool.normalize(path);
    svn.dump(p, src, function (err, version) {
      if (err) {
        Factory.getLog('svn').error('SVN_ERROR', err.message);
        callback(err);
      } else {
        callback(null, version);
      }
    });
  }
}
exports.update = update;
/*}}}*/

/*{{{ submit() */
function submit(callback){
  svn.submit(getFolder(), 'submit all files', function (err) {
    if (err) {
      Factory.getLog('svn').error('SVN_ERROR', err.message);
      callback(err);
      return;
    }
    callback();
  });
}
exports.submit = submit;
/*}}}*/

/*{{{ isDir() */
function isDir(path){
  path = getFolder() + Tool.normalize(path);
  return fs.statSync(path).isDirectory();
}
exports.isDir = isDir;
/*}}}*/

