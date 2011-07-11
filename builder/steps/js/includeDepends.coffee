
depends = require 'depends'
wrench = require 'wrench'

exports.name = 'Include Depends'

exports.run = (srcDir, buildDir, files, output, opt, clbk) ->
  if opt.minify
    depends.manage srcDir, (err, depFiles) ->
      if err? then return clbk err

      files.js = depFiles.ouput
      clbk null, output, files

  else
    depends.manage buildDir, (err, files) ->
      if err? then return clbk err

      files.writeClient "#{buildDir}/loader.js", false, (err) ->
        if err? then return clbk err

        output.body += "<script src=\"/js/loader.js\"></script>"

        for file in files.output
          if not /_test\.js/.test file
            output.body += "<script src=\"/js#{file}\"></script>"

        delete files.js
        clbk null, output, files

