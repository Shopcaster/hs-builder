
var _ = require('underscore')._,
    cli = require('cli'),
    build = require('../builder/main.js'),
    serve = require('../serve/main.js'),
    child_process = require('child_process'),
    spawn = child_process.spawn,
    exec = child_process.exec;

exports.options = {};

exports.run = function(opt){
  opt['test'] = true;
  opt['no-appcache'] = true;
  opt['no-autorestart'] = true;

  build.run(opt, function(){
    serve.run(opt);
    runTests(opt);
  });
};

function runTests(opt){
  var testRunner = spawn('phantomjs', [
    __dirname+'/phantomShim.js',
    'http://'+opt.address+':'+opt.port+'/',
    opt.verbose ? '-v' : '',
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
    cli.fatal('Testing timed out after 20 seconds.');
  }, 20000);
}

function color(string){
  var lines = string.split('\n');
  for (i in lines){
    if (/Error:/.test(lines[i]))
      lines[i] = stylize(lines[i], 'red');
    else if (/failed:/.test(lines[i]))
      lines[i] = stylize(lines[i], 'red');
    else if (/passed:/.test(lines[i]))
      lines[i] = stylize(lines[i], 'green');
    else if (/^http.*\.js:\d+/.test(lines[i]))
      lines[i] = stylize(lines[i], 'grey');
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
