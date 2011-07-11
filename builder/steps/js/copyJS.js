(function() {
  var depends, fs;
  depends = require('depends');
  fs = require('fs');
  exports.name = 'Copy JavaScript';
  exports.run = function(srcDir, buildDir, files, output, opt, mainClbk) {
    var recurse;
    if (!opt.minify) {
      return (recurse = function(oDir, nDir, clbk) {
        if (typeof err !== "undefined" && err !== null) {
          return clbk(err);
        }
        return fs.stat(oDir, function(err, oDirStat) {
          if (err != null) {
            return clbk(err);
          }
          return fs.mkdir(nDir, oDirStat.mode, function(err) {
            return fs.readdir(oDir, function(err, files) {
              var nextFile;
              if (err != null) {
                return clbk(err);
              }
              return (nextFile = function(err) {
                var file, filename, newFile;
                if (err != null) {
                  return clbk(err);
                }
                filename = files.shift();
                if (!(filename != null)) {
                  return clbk();
                }
                file = "" + oDir + "/" + filename;
                newFile = "" + nDir + "/" + filename;
                return fs.stat(file, function(err, fileStat) {
                  if (fileStat.isDirectory()) {
                    return recurse(file, newFile, nextFile);
                  } else if (/\.js$/.test(file)) {
                    return fs.readFile(file, function(err, data) {
                      if (err != null) {
                        return clbk(err);
                      }
                      return fs.writeFile(newFile, data, nextFile);
                    });
                  } else {
                    return nextFile();
                  }
                });
              })();
            });
          });
        });
      })(srcDir, buildDir, function(err) {
        return mainClbk(err, output, files);
      });
    } else {
      return mainClbk(null, output, files);
    }
  };
}).call(this);
