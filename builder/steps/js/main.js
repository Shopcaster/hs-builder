var cli, createFileMap, ensureExists, exec, fs;
fs = require('fs');
cli = require('cli');
exec = require('child_process').exec;
exports.name = 'JavaScript';
exports.options = {
  test: ['t', 'Build js with tests', 'boolean', false],
  minify: ['m', 'Minify JS using Uglify JS', 'boolean', false],
  pretify: ['p', 'Pretify minified JS using Uglify JS', 'boolean', false]
};
exports.build = function(opt, clbk) {
  var buildDir, output, srcDir;
  srcDir = opt.src + '/js';
  buildDir = opt.build + '/js';
  output = {
    head: '',
    body: ''
  };
  return ensureExists(buildDir, function() {
    return createFileMap(srcDir, function(err, files) {
      var next, steps;
      if (err != null) {
        return typeof clbk === "function" ? clbk(err) : void 0;
      }
      steps = [require('./compileCoffee'), require('./includeTmpl'), require('./includeDepends'), require('./includeTests'), require('./minifyJS')];
      return (next = function(err, output, files) {
        var step;
        if (err != null) {
          return typeof clbk === "function" ? clbk(err) : void 0;
        }
        step = steps.shift();
        if (!(step != null)) {
          return clbk(null, output);
        }
        cli.info('    JS step: ' + step.name);
        return step.run(srcDir, buildDir, files, output, opt, next);
      })(null, output, files);
    });
  });
};
/*
 calls clbk(error, files) with a list of any files in the passed directory
*/
createFileMap = function(dir, clbk) {
  var files;
  files = {};
  return fs.readdir(dir, function(err, filenames) {
    var next;
    if (err != null) {
      return typeof clbk === "function" ? clbk(err) : void 0;
    }
    return (next = function() {
      var file, filename;
      filename = filenames.shift();
      file = dir + '/' + filename;
      if (!(filename != null)) {
        return typeof clbk === "function" ? clbk(null, files) : void 0;
      }
      return fs.stat(file, function(err, stat) {
        var parsed, _name;
        if (err != null) {
          return typeof clbk === "function" ? clbk(err) : void 0;
        }
        if (stat.isDirectory()) {
          return createFileMap(file, function(err, subMap) {
            var ext, subFiles;
            if (err != null) {
              return typeof clbk === "function" ? clbk(err) : void 0;
            }
            for (ext in subMap) {
              subFiles = subMap[ext];
              files[ext] || (files[ext] = []);
              files[ext] = files[ext].concat(subFiles);
            }
            return next();
          });
        } else {
          if (/_test\.js$/.test(file)) {
            files.test || (files.test = []);
            files.test.push(file);
          } else {
            parsed = /\.(\w+)$/.exec(file);
            if (parsed) {
              files[_name = parsed[1]] || (files[_name] = []);
              files[parsed[1]].push(file);
            }
          }
          return next();
        }
      });
    })();
  });
};
ensureExists = function(dir, clbk) {
  return exec('mkdir -p ' + dir, clbk);
};