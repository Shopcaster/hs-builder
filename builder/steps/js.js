
var fs = require('fs'),
    _ = require('underscore')._,
    cli = require('cli'),
    exec = require('child_process').exec;

exports.name = 'JavaScript';

exports.options = {
  test: ['t', 'Build js with tests'],
};

exports.build = function(opt, clbk){
  var srcDir = opt.src+'/js',
      buildDir = opt.build+'/js',
      op = '';
  if (opt.test) op = '<h1 id="qunit-header">QUnit example</h1><h2 id="qunit-banner"></h2><div id="qunit-testrunner-toolbar"></div><h2 id="qunit-userAgent"></h2><ol id="qunit-tests"></ol><div id="qunit-fixture">test markup, will be hidden</div>'

  fs.mkdir(buildDir, 0766, function(err){
    if (err) return clbk(err);
    resolveDependancies(srcDir, function(err, files){
      if (err) return clbk(err);
      var done = _.after(files.length, function(){clbk(null, {body: op})});
      _.each(files, function(file){
        if (/(?!_test)\.js$/.test(file) || (opt.test && /_test\.js$/.test(file))){
          op += '<script src="js'+file.replace(srcDir, '')+'"></script>';
          fs.readFile(file, function(err, data){
            if (err) return clbk(err);
            var newFilename = file.replace(srcDir, buildDir),
                newPath = newFilename.split('/').slice(0, -1).join('/');
            exec('mkdir -p '+newPath, function(){
              fs.writeFile(file.replace(srcDir, buildDir), data, done);
            });
          });
        }else if (/\.tmpl$/.test(file)){
          fs.readFile(file, 'utf8', function(err, tmpl){
            if (err) return clbk(err);
            op += tmpl;
            done();
          });
        }else{
          done();
        }
      });
    });
  });
};

function resolveDependancies(dir, clbk){
  createFileList(dir, function(err, fileList){
    if (err) return clbk(err);
    makeDepList(dir, fileList, function(err, depList){
      if (err) return clbk(err);
      resolveDepList(depList, function(err, resolvedFiles){
        if (err) return clbk(err);
        clbk(null, resolvedFiles);
      });
    });
  });
}

function createFileList(dir, clbk){
  var fileList = [];
  fs.readdir(dir, function(err, filenames){
    if (err) return clbk(err);
    (function next(){
      var filename = filenames.shift(),
          file = dir+'/'+filename;
      if (filename == null || typeof filename == 'undefined')
        return clbk(null, fileList);

      fs.stat(file, function(err, stat){
        if (err) return clbk(err);
        if (stat.isDirectory()){
          createFileList(file, function(err, subList){
            if (err) return clbk(err);
            fileList = fileList.concat(subList);
            next();
          })
        }else{
          fileList.push(file);
          next();
        }
      });
    })();
  });
}

function makeDepList(root, fileList, clbk){
  var depList = {},
      reg = /(?:\/\/|<!--)depends:([\w\-\.\s\n\/,]+?[^,])[\n\r]+/;
  (function next(){
    var file = fileList.shift();
    if (file == null || typeof file == 'undefined')
      return clbk(null, depList);

    fs.readFile(file, 'utf8', function(err, contents){
      if (err) return clbk(err);

      var deps = reg.exec(contents);
      if (deps == null){
        depList[file] = [];
        return next();
      }
      deps = deps[1]
          .replace('-->', '')
          .replace(/\s/g, '')
          .replace(/\/\//g, '')
          .replace(/\n/g, '')
          .split(',');
      deps = _.map(deps, function(dep){return root+'/'+dep});
      depList[file] = deps;
      next();
    })
  })();
}

function resolveDepList(depList, clbk){
  var resolvedList = [],
      revs = 0,
      maxRevs = 200;
  while(_.size(depList)){
    if (revs++ >= maxRevs)
      return clbk('Unable to resolve the following after '+revs+' revs: '
          +JSON.stringify(_.keys(depList)));

    _.each(depList, function(deps, file){
      var isMet = deps.length == 0;
      if (!isMet) isMet = _.reduce(deps, function(isMet, dep){
        return isMet && _.include(resolvedList, dep);
      }, true);
      if (isMet){
        resolvedList.push(file);
        delete depList[file];
      }
    });
  }
  clbk(null, resolvedList);
}
