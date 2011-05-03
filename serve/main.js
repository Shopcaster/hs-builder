#!/usr/bin/env node

var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    mime = require('mime'),
    exec = require('child_process').exec,
    cli = require('cli'),
    build = require('../builder/main.js'),
    staticResponse = require('./staticResponse/render.js');

exports.serve = function(opt){
  mime.define({
    'text/cache-manifest': ['appcache', 'appCache'],
  });

  var onRequest = function (req, res) {
    var uri = url.parse(req.url).pathname,
        filename = path.join(opt.build, uri);

    if (staticResponse.render(req, res)) return;

    path.exists(filename, function(exists) {
      if(!exists) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.write('404 Not Found\n');
        end();
        return;
      }

      fs.stat(filename, function(err, stat){
        if (err) return errEnd();
        if (stat.isDirectory()) filename += '/index.html';

        fs.readFile(filename, 'binary', function(err, file) {
          if (err) return errEnd();

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

  var server = http.createServer(onRequest).listen(opt.port, '0.0.0.0');

  (function waitForChange(){
    exec('inotifywait -r '+opt.src, function(){
      build.build(opt, function(){
        // setver.close();
        // server = http.createServer(onRequest).listen(3000, '0.0.0.0');
        waitForChange();
      });
    });
  })();

  cli.info('Server running at http://0.0.0.0:'+opt.port+'/');
}
