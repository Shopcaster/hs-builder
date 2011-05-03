
var fs = require('fs'),
    exec = require('child_process').exec,
    _ = require('underscore')._,
    cli = require('cli');

exports.name = 'CSS';

exports.build = function(opt, clbk){
  var buildCss = opt.build+'/css',
      srcCss = opt.src+'/css';

  cli.debug('buildCss:'+buildCss+' srcCss:'+srcCss);
  fs.mkdir(buildCss, 0766, function(){
    var cmd = 'sass --update '+srcCss+':'+buildCss;
    cli.debug('CSS command: '+cmd);
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
