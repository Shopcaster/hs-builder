
var fs = require('fs'),
    wrench = require('wrench'),
    _ = require('underscore')._;

exports.name = 'Config';

exports.options = {
  'jsconf': ['c', 'JSON config file', 'path', './localConf.json']
};

exports.build = function(opt, clbk){
  fs.readFile(opt.src+'/conf.json', 'utf8', function(err, data){
    if (err) return clbk(err);
    data = JSON.parse(data);
    var done = function(){
      clbk(null, {head: '<script>var conf = '+JSON.stringify(data)+'</script>'});
    };

    fs.readFile(opt.jsconf, 'utf8', function(err, localData){
      if (err) return done();
      _.extend(data, JSON.parse(localData));
      done();
    });
    ;
  });
};
