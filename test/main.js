
var _ = require('underscore')._,
    cli = require('cli'),
    build = require('../builder/main.js'),
    serve = require('../serve/main.js'),
    spawn = require('child_process').spawn;

exports.options = {};

exports.run = function(opt){
  opt.test = true
  cli.info('Building with tests:');
  build.run(opt, function(){
    cli.info('\nRunning server:');
    opt['no-autorestart'] = true;
    serve.run(opt);

    cli.info('\nRunning tests:\n');
    var testRunner = spawn('phantomjs', [
      __dirname+'/phantomShim.js',
      'http://'+opt.address+':'+opt.port+'/'
    ]);

    testRunner.stdout.on('data', function(data){
      process.stdout.write(''+data);
    });

    testRunner.stderr.on('data', function(data){
      process.stdout.write(''+data);
    });

    testRunner.on('exit', function (code) {
      process.exit(code);
    });
    setTimeout(function(){
      cli.fatal('Tests timed out after 10 seconds.');
    }, 10000);
  });
};
