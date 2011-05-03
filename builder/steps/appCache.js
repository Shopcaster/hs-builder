
var fs = require('fs'),
    _ = require('underscore')._,
    manifestFilename = 'manifest.appcache';

exports.name = 'Application Cache';

exports.build = function(srcDir, buildDir, clbk){
    var manifestFile = buildDir+'/'+manifestFilename,
        manifest = '';

    manifest += 'CACHE MANIFEST\n';
    manifest += '#built: '+ Math.round(new Date().getTime() / 1000) +'\n\n';

    listDirectory(buildDir, function(err, result){

        manifest += _.map(result, function(file){
            return file.replace(buildDir+'/', '');
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
