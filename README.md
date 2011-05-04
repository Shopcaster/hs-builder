
Hipsell build tool. Install with npm:

    npm -g install /path/to/hs-builder

The `-g` flag allows the hsb command to be added to your path.

  Usage:
    hsb [OPTIONS] <command> [ARGS]

  Options:
    -s, --src [PATH]       Source directory (Default is ./src)
    -b, --build [PATH]     Build directory (Default is ./build)
    -a, --address [STRING] Address to serve on (Default is 0.0.0.0)
    -p, --port [NUMBER]    Serve on port (Default is 3000)
    -k, --no-color         Omit color from output
        --debug            Show debug information
    -h, --help             Display help and usage details

  Commands:
    build, serve, test


