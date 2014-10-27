var path = require('path');
var util = require('util');

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    coffee: {
      files: {
        expand:  true,
        flatten: true,
        src:     'src/*.coffee',
        dest:    'lib',
        ext:     '.js'
      }
    },

    watch: {
      coffee: {
        files: ['src/*.coffee'],
        tasks: ['coffee']
      },

      javascript: {
        files: ['lib/*.js', 'src/browserify.js'],
        tasks: ['browserify']
      }
    },

    uglify: {
      options: {
        mangle: {
          except: ['RAML', 'Q']
        }
      },

      javascript: {
        files: {
          'dist/raml-parser.min.js': ['dist/raml-parser.js']
        }
      }
    },

    connect: {
      server: {
        options: {
          port: 9001,
          base: '.'
        }
      }
    },

    mocha_phantomjs: {
      all: {
        options: {
          urls: [
            'http://localhost:9001/test/specs/parser.html'
          ],
          reporter: 'dot'
        }
      }
    },

    mochacli: {
      options: {
        require:  ['chai', 'chai-as-promised'],
        reporter: 'dot',
        bail:     true,
        grep:     grunt.option('grep') || ''
      },
      all: ['test/specs/*.js']
    },

    coffeelint: {
      options: {
        max_line_length: {
          level: 'ignore'
        }
      },
      app: ['src/*.coffee']
    },

    shell: {
      options: {
        failOnError: true
      },

      browserify: {
        command: [
          'mkdir -p dist',
          '&&',
          './node_modules/.bin/browserify',
          '--standalone RAML.Parser',
          util.format('--noparse %s', path.join(__dirname, 'node_modules/inflection/lib/inflection.js')),
          util.format('--noparse %s', path.join(__dirname, 'node_modules/q/q.js')),
          '--outfile dist/raml-parser.js',
          'lib/raml.js'
        ].join(' ')
      }
    }
  });

  grunt.registerTask('compile', [
    'coffeelint',
    'coffee'
  ]);

  grunt.registerTask('build', [
    'compile',
    'shell:browserify',
    'uglify'
  ]);

  grunt.registerTask('test', [
    'compile',
    'connect',
    'mochacli',
    'mocha_phantomjs'
  ]);

  grunt.registerTask('test:node', [
    'compile',
    'connect',
    'mochacli'
  ]);

  grunt.registerTask('test:browser', [
    'compile',
    'shell:browserify',
    'connect',
    'mocha_phantomjs'
  ]);

  grunt.registerTask('server', [
    'build',
    'connect',
    'watch'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);
};
