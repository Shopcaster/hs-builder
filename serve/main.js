#!/usr/bin/env node

var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    mime = require('mime'),
    exec = require('child_process').exec,
    cli = require('cli'),
    _ = require('underscore')._
    build = require('../builder/main.js'),
    handlers = [
      require('./shebang/render.js')
    ];

exports.options = _.reduce(handlers, function(ops, handler){
  return _.extend(ops, handler.options);
}, {
  address:  ['a', 'Address to serve on', 'string', '0.0.0.0'],
  port:  ['p', 'Serve on port', 'number', 3000],
  'no-autorestart':  [false, 'Disable autorestart on file change', 'boolean', false],
});

exports.run = function(opt){
  mime.define({
    'text/cache-manifest': ['appcache', 'appCache'],
  });

  var onRequest = function (req, res) {
    var uri = url.parse(req.url).pathname,
        filename = path.join(opt.build, uri);

    if (_.any(handlers, function(handler){
      cli.debug('Serve: trying handler: '+handler.name);
      return handler.run(req, res, opt);
    })) return;
    cli.debug('Serve: serving static');

    path.exists(filename, function(exists) {
      if(!exists) {
        res.writeHead(301, {'Location': '/#!'+uri});
        end();
        return;
      }

      fs.stat(filename, function(err, stat){
        if (err) return errEnd('Something wrong with stat: ' + err);
        if (stat.isDirectory()) filename += '/index.html';

        fs.readFile(filename, 'binary', function(err, file) {
          if (err) return errEnd('Unable to read file ' + filename);

          res.writeHead(200, {'Content-Type': mime.lookup(filename)});
          res.write(file, 'binary');
          end();
        });
      });
    });

    function end(){
      cli.info(req.method+' '+res.statusCode+' '+uri);
      res.end();
    };

    function errEnd(err){
      cli.error(err);
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.write(err + '\n');
      end();
    };
  };

  var server = http.createServer(onRequest).listen(opt.port, opt.address);

  if (!opt['no-autorestart']){
    build.run(opt, function(){
      (function waitForChange(){
        exec('inotifywait -r '+opt.src, function(err){
          //if there's no inotifywait, bail on the auto-refresh
          if (err) return;

          build.run(opt, function(err){
            if (err) cli.fatal(err);
            cli.info('http://'+opt.address+':'+opt.port+'/');
            waitForChange();
          });
        });
      })();
    });
  }

  cli.info('Server started at http://'+opt.address+':'+opt.port+'/');
}
