
var fs = require('fs'),
    wrench = require('wrench'),
    _ = require('underscore')._;

exports.name = 'Images';

exports.options = {};

exports.build = function(opt, clbk){
  wrench.copyDirRecursive(opt.src+'/img', opt.build+'/img', function(err){
    if (err) return clbk(err);
    fs.readFile(opt.src+'/img/favicon.ico', function(err, data){
      if (err) return clbk(err);
      fs.writeFile(opt.build+'/favicon.ico', data, clbk);
    });
  });
};

