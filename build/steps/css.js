
var fs = require('fs'),
    exec = require('child_process').exec,
    _ = require('underscore')._,
    cli = require('cli');

exports.name = 'CSS';

exports.build = function(srcDir, buildDir, clbk){
  var buildCss = buildDir+'/css',
      srcCss = srcDir+'/css';

  fs.mkdir(buildCss, 0766, function(){
    cmd = 'sass --update '+srcCss+':'+buildCss;
    exec(cmd, function(err, stdout, stderr){
      if (err) cli.fatal(stdout+' '+stderr);
      fs.readdir(buildCss, function(err, files){
        var output = '',
            done = _.after(files.length, function(){
              clbk(null, {head: output});
            });
        _.each(files, function(file){
          if (/^[^_][\w-]+\.css$/.test(file)){
            output += '<link rel="stylesheet" type="text/css" href="';
            output += 'css/'+file;
            output += '">';
          }
          done();
        });
      });
    });
  });
};
