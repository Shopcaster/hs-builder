
var fs = require('fs'),
  _ = require('underscore')._,
  manifestFilename = 'manifest.appcache';

exports.name = 'Application Cache';

exports.options = {
  'no-appcache': [false, 'Disable HTML5 Application Cache', 'boolean', false]
};

exports.build = function(opt, clbk){
  if (opt['no-appcache'] || opt['test']) return clbk(null, {});

  var manifestFile = opt.build+'/'+manifestFilename,
    manifest = '';

  manifest += 'CACHE MANIFEST\n';
  manifest += '#built: '+ Math.round(new Date().getTime() / 1000) +'\n\n';
  manifest += 'NETWORK:\n*\n\n';
  manifest += 'CACHE:\n';

  listDirectory(opt.build, function(err, result){

    manifest += _.map(result, function(file){
      return file.replace(opt.build+'/', '');
    }).join('\n');

    fs.writeFile(manifestFile, manifest, function(){
      clbk(null, {htmlAttr: 'manifest="'+manifestFilename+'"'});
    });
  });
};

function listDirectory(dir, clbk){
  var result = [];
  fs.readdir(dir, function(err, files){
    if (err) return clbk(err);
    var done = _.after(files.length+1, function(){
      clbk(null, result);
    });
    done();
    _.each(files, function(filename){
      var file = dir+'/'+filename;
      fs.stat(file, function(err, stat){
        if (err) return clbk(err);
        if (stat.isDirectory())
          listDirectory(file, function(err, subResult){
            if (err) return clbk(err);
            result = result.concat(subResult);
            done();
          });
        else if (filename == manifestFilename)
          done();
        else{
          result.push(file);
          done();
        }
      });
    });
  });
};
