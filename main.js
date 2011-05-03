#!/usr/bin/env node

var cli = require('cli').enable('status'),
  build = require('./builder/main.js'),
  serve = require('./serve/main.js'),
  fs = require('fs');

cli.parse({
  port:  ['p', 'Serve on port', 'number', 3000],
  src: ['s', 'Source directory', 'path', './src'],
  build: ['b', 'Build directory', 'path', './build'],
}, ['build', 'serve']);

cli.main(function(args, opt){
  cleanOpt(opt, function(opt){
    cli.debug('using options: '+ JSON.stringify(opt));
    if (cli.command == 'build'){
      cli.info('Building...');
      build.build(opt);
    }else if (cli.command == 'serve'){
      cli.info('Serving...');
      serve.serve(opt);
    }
  });
});

function cleanOpt(opt, clbk){
  fs.realpath(opt.build, function(err, buildPath){
    if (err) cli.fatal(err);
    opt.build = buildPath;
    fs.realpath(opt.src, function(err, srcPath){
      if (err) cli.fatal(err);
      opt.src = srcPath;
      clbk(opt);
    });
  });
}
