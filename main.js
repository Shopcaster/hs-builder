#!/usr/bin/env node

var cli = require('cli').enable('status'),
    fs = require('fs'),
    _ = require('underscore')._;

var commands = {
  'build': require('./builder/main.js'),
  'serve': require('./serve/main.js'),
  'test': { // require('./test/main.js'),
    run: function(opt){
      opt.test = true
      commands.build.run(opt, function(){
        commands.serve.run(opt);
      });
    },
    name: 'Test',
    options: {}
  }
}

cli.parse(
  // extend global options with the options member of each command module
  _.reduce(commands, function(ops, cmd){
    return _.extend(ops, cmd.options);
  }, { // global options
    src: ['s', 'Source directory', 'path', './src'],
    build: ['b', 'Build directory', 'path', './build'],
  }),
  _.keys(commands)
);

cli.main(function(args, opt){
  cleanOpt(opt, function(opt){
    cli.debug('options: '+ JSON.stringify(opt));
    commands[cli.command].run(opt);
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
