var fs;
fs = require('fs');
exports.name = 'Include Templates';
exports.run = function(srcDir, buildDir, files, output, opt, clbk) {
  var next;
  if (files.tmpl) {
    return (next = function() {
      var tmpl;
      tmpl = files.tmpl.shift();
      if (!(tmpl != null)) {
        delete files.tmpl;
        return clbk(null, output, files);
      }
      return fs.readFile(tmpl, 'utf8', function(err, tmplContent) {
        var name;
        if (err != null) {
          return clbk(err);
        }
        name = /\/([\w-]+)\.tmpl$/.exec(tmpl)[1];
        output.head += "          <script id=\"" + name + "\" type=\"text/html\">" + tmplContent + "</script>";
        return next();
      });
    })();
  } else {
    return clbk(null, output, files);
  }
};