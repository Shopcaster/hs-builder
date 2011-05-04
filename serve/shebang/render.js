
var _ = require('underscore')._,
    url = require('url'),
    exec = require('child_process').exec;

exports.render = function(req, res, options){
  if (req.method != 'GET') return false;
  var reqUrl = url.parse(req.url, true),
      fragment = reqUrl.query._escaped_fragment_;
  if (typeof fragment == 'undefined') return false;

  var realUrl = 'http://0.0.0.0:3000/#\\!'+fragment;

  exec('phantomjs '+__dirname+'/phantomShim.js '+realUrl, function(err, stdout, stderr){
    if (err){
      console.log('error:', err);
      console.log('stdout', stdout);
      console.log('stderr', stderr);
    }
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(stdout);
    res.end();
  });
  return true;
};
