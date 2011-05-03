
var fs = require('fs'),
    wrench = require('wrench'),
    _ = require('underscore')._;

exports.name = 'Images';

exports.build = function(srcDir, buildDir, clbk){
  wrench.copyDirRecursive(srcDir+'/img', buildDir+'/img', function(err){
    if (err) return clbk(err);
    fs.readFile(srcDir+'/img/favicon.ico', function(err, data){
      if (err) return clbk(err);
      fs.writeFile(buildDir+'/favicon.ico', data, clbk);
    });
  });
};

