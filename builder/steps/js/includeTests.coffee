
fs = require 'fs'
exec = require('child_process').exec

exports.name = 'Include Tests'

exports.run = (srcDir, buildDir, files, output, opt, clbk) ->
  if files.test and opt.test
    (next = () ->
      file = files.test.shift();

      if not file?
        delete files.test
        return clbk null, output, files

      output.body += '<script src="js'+file.replace(srcDir, '')+'"></script>'

      copyFile file, file.replace(srcDir, buildDir), next
    )()
  else
    clbk null, output, files


copyFile = (from, to, clbk) ->
  fs.readFile from, (err, data) ->
    if err? then return clbk?(err)
    exec 'mkdir -p '+to.split('/').slice(0, -1).join('/'), () ->
      fs.writeFile to, data, clbk
