(function() {
  var cli, exec;
  cli = require('cli');
  exec = require('child_process').exec;
  exports.name = 'Compile Coffee';
  exports.run = function(srcDir, buildDir, files, output, opt, clbk) {
    return exec("coffee -c -o " + buildDir + " " + srcDir, function(err) {
      return clbk(err, output, files);
    });
  };
}).call(this);
