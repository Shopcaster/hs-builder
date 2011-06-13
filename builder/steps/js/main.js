
var fs = require('fs'),
    _ = require('underscore')._,
    cli = require('cli'),
    exec = require('child_process').exec,
    ujs = require('uglify-js');
    // ujsParse = require("uglify-js").parser,
    // ujsUglify = require("uglify-js").uglify;

exports.name = 'JavaScript';

exports.options = {
  test: ['t', 'Build js with tests', 'boolean', false],
  minify: ['m', 'Minify JS using Uglify JS', 'boolean', false],
  pretify: ['p', 'Pretify minified JS using Uglify JS', 'boolean', false],
};

exports.build = function(opt, clbk){
  var srcDir = opt.src+'/js',
      buildDir = opt.build+'/js',
      op = '';
  if (opt.test){
    var fail = function(err){if (err) cli.fatal(err)};
    copyFile(__dirname+'/qunit/qunit.js', buildDir+'/qunit.js', fail);
    copyFile(__dirname+'/qunit/qunit.css', opt.build+'/css/qunit.css', fail);
    op += '<script src="js/qunit.js"></script>'
         +'<script>QUnit.reset = function(){localStorage.clear()}</script>'
         +'<link rel="stylesheet" type="text/css" href="css/qunit.css">'
         +'<h1 id="qunit-header">QUnit example</h1>'
         +'<h2 id="qunit-banner"></h2>'
         +'<div id="qunit-testrunner-toolbar"></div>'
         +'<h2 id="qunit-userAgent"></h2>'
         +'<ol id="qunit-tests"></ol>'
         +'<div id="qunit-fixture">test markup, will be hidden</div>';
  }

  fs.mkdir(buildDir, 0766, function(err){
    if (err) return clbk(err);
    resolveDependancies(srcDir, function(err, files){
      if (err) return clbk(err);

      var tmplNames = [];

      (function scriptWrap(clbk){
        if (files.tmpl)
          (function nextTmpl(){
            var tmpl = files.tmpl.shift();

            if (!tmpl){
              delete files.tmpl;
              return scriptWrap(clbk);
            }

            fs.readFile(tmpl, 'utf8', function(err, tmplContent){
              if (err) return clbk(err);
              var name = /\/([\w-]+)\.tmpl$/.exec(tmpl)[1];
              tmplNames.push(name);
              op += '<script id="'+name+'" type="text/html">'
              op += tmplContent;
              op += '</script>'
              nextTmpl();
            });
          })();
        else if (files.haml)
          (function nextHaml(){
            var file = files.haml.shift();

            if (!file){
              delete files.haml;
              return scriptWrap(clbk);
            }

            fs.readFile(file, 'utf8', function(err, tmpl){
              if (err) return clbk(err);
              var name = /\/([\w-]+)\.haml$/.exec(file)[1];
              tmplNames.push(name);
              var cmd = 'haml '+file;
              cli.debug('HAML command: '+cmd);
              exec(cmd, function(err, stdout, stderr){
                if (err) return clbk(err);
                tmpl = stdout;
                cli.debug('Rendered HAML: '+tmpl);
                op += '<script id="'+name+'" type="text/html">'
                op += tmpl;
                op += '</script>'
                nextHaml();
              });
            });
          })();
        else if (files.js && !opt.minify)
          (function nextJS(){
            var file = files.js.shift();

            if (!file){
              delete files.js;
              return scriptWrap(clbk);
            }

            op += '<script src="js'+file.replace(srcDir, '')+'"></script>';
            copyFile(file, file.replace(srcDir, buildDir), nextJS);
          })();
        else if (files.js){
          var js = '';

          (function nextJSMin(){
            var file = files.js.shift();

            if (!file){

              var comp;
              var ast = ujs.parser.parse(js),
                  ast = ujs.uglify.ast_mangle(ast, {toplevel: true}),
                  ast = ujs.uglify.ast_squeeze(ast);

              if (!opt.pretify)
                comp = ujs.uglify.gen_code(ast);
              else{
                comp = ujs.uglify.gen_code(ast, {
                  beautify: true,
                  indent_start: 0,
                  indent_level: 2
                });
              }

              op += '<script>\n'+comp+'\n</script>';

              delete files.js;
              return scriptWrap(clbk);
            }

            fs.readFile(file, 'utf8', function(err, script){
              js += '\n\n'+script;
              nextJSMin();
            });

          })();
        }else if (files.test && opt.test)
          (function nextTest(){
            var file = files.test.shift();

            if (!file){
              delete files.test;
              return scriptWrap(clbk);
            }

            op += '<script src="js'+file.replace(srcDir, '')+'"></script>';
            copyFile(file, file.replace(srcDir, buildDir), nextTest);
          })();
        else
          clbk();
      })(function(){
        clbk(null, {body: op});
      });

    });
  });
};

/**
* calls clbk(error, files) with any javascript file dependancies resolved.
* files: {extension: [filename, ...]}
**/
function resolveDependancies(dir, clbk){
  createFileList(dir, function(err, fileList){
    if (err) return clbk(err);
    fileList = sortByExt(fileList);
    makeDepList(dir, fileList.js, function(err, depList){
      if (err) return clbk(err);
      resolveDepList(depList, function(err, resolvedFiles){
        if (err) return clbk(err);
        fileList.js = resolvedFiles;
        clbk(null, fileList);
      });
    });
  });
}

/**
* calls clbk(error, files) with a list of any files in the passed directory
**/
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

/**
* takes a list of filenames, and returns an object
* {fileExtension: [filename, ...]}. The only exception is any _test.js
* files, which will be in resp.test
**/
function sortByExt(files){
  var resp = {
    test: [],
  };

  files.forEach(function(file){
    if (/_test\.js$/.test(file))
      return resp.test.push(file);

    var parsed = /\.(\w+)$/.exec(file);

    if (parsed){
      resp[parsed[1]] = resp[parsed[1]] || [];
      resp[parsed[1]].push(file);
    }
  });
  return resp;
}

/**
* takes a root directory, a list of files, and a callback
* calls clbk(error, dependancyList) where dependancyList
* is in the form: {file: [dep1, dep2, ...]}
**/
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

/**
* takes a dependancy object in the form: {file: [dep1, dep2, ...]}
* and calls clbk(error, files) where files is an array of files
* ordered so dependancies are resolved
**/
function resolveDepList(depList, clbk){
  var resolvedList = [],
      revs = 0,
      maxRevs = 200;
  while(_.size(depList)){
    if (revs++ == maxRevs){
      var unmet = {};
      var unmetReverse = {};
      _.each(depList, function(deps, file){
        unmet[file] = _.reduce(deps, function(unmet, dep){
          if (!_.include(resolvedList, dep)){
            unmet.push(dep);
            unmetReverse[dep] = unmetReverse[dep] || [];
            unmetReverse[dep].push(file);
          }
          return unmet;
        }, []);
      });
      var unresolved = _(unmet).chain().values().flatten().unique().value();
      var pending = _.keys(depList);
      var unavailable = _.reduce(unresolved, function(left, dep){
        if (_.indexOf(pending, dep) == -1)
          left.push(dep);
        return left;
      }, []);
      var needed = {};
      _.each(unmetReverse, function(files, dep){
        if (_.indexOf(unavailable, dep) > -1)
          needed[dep] = files;
      });

      return clbk('Unable to find dependancies ({missing file: [needs file, ..]}): '
          +JSON.stringify(needed, null, 2));
    }

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

function copyFile(from, to, clbk){
  fs.readFile(from, function(err, data){
    if (err && clbk) return clbk(err);
    else if (err) return;
    exec('mkdir -p '+to.split('/').slice(0, -1).join('/'), function(){
      fs.writeFile(to, data, clbk);
    });
  });
}
