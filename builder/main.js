#!/usr/bin/env node

var _ = require('underscore')._,
    cli = require('cli'),
    fs = require('fs'),
    wrench = require('wrench'),
    exec = require('child_process').exec,
    buildSteps = [ // add build steps here:
      require('./steps/conf.js'),
      require('./steps/css.js'),
      require('./steps/js/main.js'),
      require('./steps/img.js'),
      //should come after anything that modifies the build dir
      require('./steps/appCache.js'),
    ];

exports.options = _.reduce(buildSteps, function(ops, step){
  return _.extend(ops, step.options);
}, {
  dropdb: [false, 'Drop database by this name before building', 'string', false]
});

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

  var startBuild = function(){
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
  };

  if (opt.dropdb)
    exec('mongo '+opt.dropdb+' '+__dirname+'/mongoDropper.js', function(err){
      if (err) cli.fatal(err);
      startBuild();
    });
  else
    startBuild();

  function errOut(err){
    cli.debug('build error: '+err);
    if (buildClbk){
      buildClbk(err);
    }else{
      cli.fatal(err);
    }
  }
};
