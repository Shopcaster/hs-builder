
fs = require 'fs'

exports.name = 'Include Templates'

exports.run = (srcDir, buildDir, files, output, opt, clbk) ->
  if files.tmpl
    (next = () ->
      tmpl = files.tmpl.shift();

      if not tmpl?
        delete files.tmpl
        return clbk null, output, files

      fs.readFile tmpl, 'utf8', (err, tmplContent) ->
        if err? then return clbk err

        name = /\/([\w-]+)\.tmpl$/.exec(tmpl)[1]

        output.head += "
          <script id=\"#{name}\" type=\"text/html\">#{tmplContent}</script>"

        next()
    )()
  else
    clbk null, output, files
