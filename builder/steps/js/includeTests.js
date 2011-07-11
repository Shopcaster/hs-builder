(function() {
  var copyFile, exec, fs;
  fs = require('fs');
  exec = require('child_process').exec;
  exports.name = 'Include Tests';
  exports.run = function(srcDir, buildDir, files, output, opt, clbk) {
    var next;
    if (files.test && opt.test) {
      return (next = function() {
        var file;
        file = files.test.shift();
        if (!(file != null)) {
          delete files.test;
          return clbk(null, output, files);
        }
        output.body += '<script src="js' + file.replace(srcDir, '') + '"></script>';
        return copyFile(file, file.replace(srcDir, buildDir), next);
      })();
    } else {
      return clbk(null, output, files);
    }
  };
  copyFile = function(from, to, clbk) {
    return fs.readFile(from, function(err, data) {
      if (err != null) {
        return typeof clbk === "function" ? clbk(err) : void 0;
      }
      return exec('mkdir -p ' + to.split('/').slice(0, -1).join('/'), function() {
        return fs.writeFile(to, data, clbk);
      });
    });
  };
}).call(this);
