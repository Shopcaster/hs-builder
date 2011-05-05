
var url = require('url'),
    http = require('http'),
    util = require('util'),
    cli = require('cli');

exports.name = 'API Proxy';
exports.options = {
  'api-host': [false, 'API server host', 'string', 'dev.hipsell.com'],
  'api-port': [false, 'API server port', 'number', 80],
  'api-path': [false, 'path to proxy to the API server', 'string', '/api'],
};
exports.run = function(req, res, opt){
  var leadingTrailingSlash = /(^\/|\/$)/g,
      path = '/'+url.parse(req.url).pathname.replace(leadingTrailingSlash, ''),
      apiPath = '/'+opt['api-path'].replace(leadingTrailingSlash, '');

  if (path.indexOf(apiPath) != 0) return false;

  cli.info('PROXY: '+req.method+' '+opt['api-host']+':'+opt['api-port']+path);

  path = path.replace(apiPath, '');

  var options = {
    host: opt['api-host'],
    port: opt['api-port'],
    path: path,
    method: req.method,
    headers: req.headers
  };

  proxy = http.request(options, function(pRes){
    pRes.on("data",function(chunk){
      res.write(chunk);
    });
    pRes.on("end", function(){
      res.end();
    });
  })
  util.pump(req, proxy);
  req.on('end', function () {
    proxy.end();
  });

  return true;
};
