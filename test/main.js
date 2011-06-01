
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
      process.stdout.write(color(''+data));
    });

    testRunner.stderr.on('data', function(data){
      if (/[WARNING]/.test(''+data)) return;
      process.stderr.write('\033[31m'+data+'\033[39m');
    });

    testRunner.on('exit', function (code) {
      process.exit(code);
    });
    setTimeout(function(){
      cli.fatal('Tests timed out after 10 seconds.');
    }, 10000);
  });
};

function color(string){
  var lines = string.split('\n');
  for (i in lines){
    if (/Error:/.test(lines[i]))
      lines[i] = stylize(lines[i], 'red');
    else if (/failed:/.test(lines[i]))
      lines[i] = stylize(lines[i], 'red');
    else if (/passed:/.test(lines[i]))
      lines[i] = stylize(lines[i], 'green');
  }
  return lines.join('\n');
}

function stylize(str, style) {
  var styles = {
  //styles
  'bold'      : [1,  22],
  'italic'    : [3,  23],
  'underline' : [4,  24],
  'inverse'   : [7,  27],
  //grayscale
  'white'     : [37, 39],
  'grey'      : [90, 39],
  'black'     : [90, 39],
  //colors
  'blue'      : [34, 39],
  'cyan'      : [36, 39],
  'green'     : [32, 39],
  'magenta'   : [35, 39],
  'red'       : [31, 39],
  'yellow'    : [33, 39]
  };
  return '\033[' + styles[style][0] + 'm' + str +
         '\033[' + styles[style][1] + 'm';
};
