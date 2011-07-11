(function() {
  var depends, wrench;
  depends = require('depends');
  wrench = require('wrench');
  exports.name = 'Include Depends';
  exports.run = function(srcDir, buildDir, files, output, opt, clbk) {
    if (opt.minify) {
      return depends.manage(srcDir, function(err, depFiles) {
        if (err != null) {
          return clbk(err);
        }
        files.js = depFiles.ouput;
        return clbk(null, output, files);
      });
    } else {
      return depends.manage(buildDir, function(err, files) {
        if (err != null) {
          return clbk(err);
        }
        return files.writeClient("" + buildDir + "/loader.js", false, function(err) {
          var file, _i, _len, _ref;
          if (err != null) {
            return clbk(err);
          }
          output.body += "<script src=\"/js/loader.js\"></script>";
          _ref = files.output;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            file = _ref[_i];
            if (!/_test\.js/.test(file)) {
              output.body += "<script src=\"/js" + file + "\"></script>";
            }
          }
          delete files.js;
          return clbk(null, output, files);
        });
      });
    }
  };
}).call(this);
