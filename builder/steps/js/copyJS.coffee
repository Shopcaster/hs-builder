
depends = require 'depends'
fs = require 'fs'

exports.name = 'Copy JavaScript'

exports.run = (srcDir, buildDir, files, output, opt, mainClbk) ->
  if not opt.minify
    (recurse = (oDir, nDir, clbk) ->
      if err? then return clbk err

      fs.stat oDir, (err, oDirStat) ->
        if err? then return clbk err

        fs.mkdir nDir, oDirStat.mode, (err) ->

          fs.readdir oDir, (err, files) ->
            if err? then return clbk err
            
            (nextFile = (err) ->
              if err? then return clbk err
          
              filename = files.shift()

              if not filename? then return clbk()

              file = "#{oDir}/#{filename}"
              newFile = "#{nDir}/#{filename}"

              fs.stat file, (err, fileStat) ->
                if fileStat.isDirectory()
                  recurse file, newFile, nextFile

                else if /\.js$/.test(file)
                  fs.readFile file, (err, data) ->
                    if err? then return clbk err

                    fs.writeFile newFile, data, nextFile
                else
                  nextFile()
            )()
    ) srcDir, buildDir, (err) -> mainClbk err, output, files
  
  else
    mainClbk null, output, files
