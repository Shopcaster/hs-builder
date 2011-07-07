
cli = require 'cli'
exec = require('child_process').exec

exports.name = 'Compile Coffee'

exports.run = (srcDir, buildDir, files, output, opt, clbk) ->
  exec "coffee -c -o #{buildDir} #{srcDir}" , (err) ->
    clbk err, output, files
