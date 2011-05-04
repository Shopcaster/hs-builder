#!/usr/bin/env node

var _ = require('underscore')._,
    cli = require('cli'),
    fs = require('fs'),
    wrench = require('wrench'),
    buildSteps = [ // add build steps here:
      require('./steps/css.js'),
      require('./steps/js.js'),
      require('./steps/img.js'),
      require('./steps/appCache.js'),
    ];

exports.options = {};

exports.run = function(opt, buildClbk){
  if (typeof opt == 'function'){
    buildClbk = opt;
    opt = {};
  }

  var buildDir = opt.build,
      srcDir = opt.src,
      buildOutput = {
        htmlAttr: '',
        head: '',
        body: '',
      },
      steps = buildSteps.slice(0);

  var writeOutput = _.once(function(){
    cli.info('Writing results to file.');
    var htmlFile = srcDir+'/html/index.html';
    fs.readFile(htmlFile, 'utf8', function(err, html){
      if (err) errOut(err);
      html = html.replace('<html', '<html '+buildOutput.htmlAttr);
      html = html.replace('</head>', buildOutput.head+'</head>');
      html = html.replace('</body>', buildOutput.body+'</body>');
      fs.writeFile(buildDir+'/index.html', html, function(){
        cli.info('Done');
        if (buildClbk) buildClbk(null);
      });
    });
  });

  var updateOutput = function(stepResult){
    _.each(stepResult, function(value, key){
      buildOutput[key] += value +' ';
    });
  };

  fs.realpath(buildDir, function(err, fullBuildDir){
    if (err) return errOut(err);
    buildDir = fullBuildDir;
    fs.realpath(srcDir, function(err, fullSrcDir){
      if (err) return errOut(err);
      srcDir = fullSrcDir;
      // rm -rf buildDir && mkdir buildDir
      wrench.rmdirRecursive(buildDir, function(err){
        if (err) return errOut(err);
        fs.mkdir(buildDir, 0766, function(err){
          if (err) return errOut(err);
          (function doStep(){
            var step = steps.shift();
            if (step == null) return writeOutput();

            cli.info('Starting build step: '+ step.name);
            step.build(opt, function(err, result){
              if (err) return errOut(err);
              if (typeof result == 'object')
                updateOutput(result);
              doStep();
            });
          })();
        });
      });
    });
  });

  function errOut(err){
    if (buildClbk){
      cli.error(err);
      buildClbk(err);
    }else{
      cli.fatal(err);
    }
  }
};
