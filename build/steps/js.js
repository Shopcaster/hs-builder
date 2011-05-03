
var fs = require('fs'),
  exec = require('child_process').exec,
  _ = require('underscore')._;

exports.name = 'JavaScript';

exports.build = function(srcDir, buildDir, clbk){
  srcDir = srcDir+'/js';
  buildDir = buildDir+'/js';
  fs.mkdir(buildDir, 0766, function(err){
    if (err) return clbk(err);
    exec(__dirname+'/../../lib/js.py -j '+srcDir, function(err, order){
      if (err) return clbk(err);
      var op = '',
        files = JSON.parse(order),
        done = _.after(files.length, function(){clbk(null, {body: op})});
      _.each(files, function(file){
        if (/\.js$/.test(file)){
          op += '<script src="js'+file.replace(srcDir, '')+'"></script>';
          fs.readFile(file, function(err, data){
            if (err) return clbk(err);
            var newFilename = file.replace(srcDir, buildDir),
              newPath = newFilename.split('/').slice(0, -1).join('/');
            exec('mkdir -p '+newPath, function(){
              fs.writeFile(file.replace(srcDir, buildDir), data, done);
            });
          });
        }else if (/\.tmpl$/.test(file)){
          fs.readFile(file, 'utf8', function(err, tmpl){
            if (err) return clbk(err);
            op += tmpl;
            done();
          });
        }else{
          done();
        }
      });
    });
  });
};

