
ujs = require 'uglify-js'
fs = require 'fs'

exports.name = 'Minify JavaScript'

exports.run = (srcDir, buildDir, files, output, opt, clbk) ->
  if files.js and opt.minify
    js = ''
    (next = () ->
      file = files.js.shift()

      if not file?
        ast = ujs.parser.parse(js)
        ast = ujs.uglify.ast_mangle(ast, {toplevel: true})
        ast = ujs.uglify.ast_squeeze(ast)

        if not opt.pretify?
          comp = ujs.uglify.gen_code(ast);
        else
          comp = ujs.uglify.gen_code ast,
            beautify: true
            indent_start: 0
            indent_level: 2

        output.body += "<script>\n#{comp}\n</script>"

        delete files.js
        return clbk null, output, files

      fs.readFile file, 'utf8', (err, script) ->
        js += '\n\n'+script;
        next()
    )()
  else
    clbk null, output, files
