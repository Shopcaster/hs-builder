(function() {
  var fs, ujs;
  ujs = require('uglify-js');
  fs = require('fs');
  exports.name = 'Minify JavaScript';
  exports.run = function(srcDir, buildDir, files, output, opt, clbk) {
    var js, next;
    if (files.js && opt.minify) {
      js = '';
      return (next = function() {
        var ast, comp, file;
        file = files.js.shift();
        if (!(file != null)) {
          ast = ujs.parser.parse(js);
          ast = ujs.uglify.ast_mangle(ast, {
            toplevel: true
          });
          ast = ujs.uglify.ast_squeeze(ast);
          if (!(opt.pretify != null)) {
            comp = ujs.uglify.gen_code(ast);
          } else {
            comp = ujs.uglify.gen_code(ast, {
              beautify: true,
              indent_start: 0,
              indent_level: 2
            });
          }
          output.body += "<script>\n" + comp + "\n</script>";
          delete files.js;
          return clbk(null, output, files);
        }
        return fs.readFile(file, 'utf8', function(err, script) {
          js += '\n\n' + script;
          return next();
        });
      })();
    } else {
      return clbk(null, output, files);
    }
  };
}).call(this);
