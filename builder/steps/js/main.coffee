
fs = require 'fs'
cli = require 'cli'
exec = require('child_process').exec

exports.name = 'JavaScript'

exports.options =
  test: ['t', 'Build js with tests', 'boolean', false]
  minify: ['m', 'Minify JS using Uglify JS', 'boolean', false]
  pretify: ['p', 'Pretify minified JS using Uglify JS', 'boolean', false]


exports.build = (opt, clbk) ->
  srcDir = opt.src+'/js'
  buildDir = opt.build+'/js'
  output =
    head: ''
    body: ''

  ensureExists buildDir, () -> createFileMap srcDir, (err, files) ->
    return clbk?(err) if err?

    steps = [
      require './copyJS'
      require './compileCoffee'
      require './includeTmpl'
      require './includeDepends'
      require './includeTests'
      require './minifyJS'
    ]

    (next = (err, output, files) ->
      return clbk?(err) if err?

      step = steps.shift()

      if not step?
        return clbk(null, output)

      cli.info '    JS step: '+ step.name

      step.run srcDir, buildDir, files, output, opt, next

    )(null, output, files)

###
 calls clbk(error, files) with a list of any files in the passed directory
###
createFileMap = (dir, clbk) ->
  files = {}

  fs.readdir dir, (err, filenames) ->
    return clbk?(err) if err?

    (next = ->
      filename = filenames.shift()
      file = dir+'/'+filename

      if not filename?
        return clbk?(null, files)

      fs.stat file, (err, stat) ->
        return clbk?(err) if err?

        if stat.isDirectory()
          createFileMap file, (err, subMap) ->
            return clbk?(err) if err?

            for ext, subFiles of subMap
              files[ext] ||= []
              files[ext] = files[ext].concat subFiles

            next()

        else
          if /_test\.js$/.test file
            files.test ||= [];
            files.test.push(file)

          else
            parsed = /\.(\w+)$/.exec file
            if parsed
              files[parsed[1]] ||= []
              files[parsed[1]].push(file)

          next()
    )()

ensureExists = (dir, clbk) ->
  exec 'mkdir -p '+dir, clbk
