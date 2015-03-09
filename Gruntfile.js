'use strict';

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    tempdir: '.tmp',
    distdir: 'dist',
    pkg: grunt.file.readJSON('package.json'),
    src: {
      js: ['src/**/*.js'],
      jsVendor: [
        'bower_components/marked/lib/marked.js',
        'bower_components/raml-js-parser/dist/raml-parser.js',
        'bower_components/highlightjs/highlight.pack.js',
        'bower_components/vkbeautify/vkbeautify.js',
        'bower_components/jquery/dist/jquery.js',
        'bower_components/velocity/velocity.js',
        'bower_components/crypto-js/rollups/hmac-sha1.js',
        'bower_components/crypto-js/components/enc-base64.js',
        'bower_components/codemirror/lib/codemirror.js',
        'bower_components/codemirror/mode/javascript/javascript.js',
        'bower_components/codemirror/mode/xml/xml.js',
        'bower_components/codemirror/mode/yaml/yaml.js',
        'bower_components/codemirror/addon/dialog/dialog.js',
        'bower_components/codemirror/addon/search/search.js',
        'bower_components/codemirror/addon/search/searchcursor.js',
        'bower_components/codemirror/addon/lint/lint.js',
        'bower_components/angular/angular.js',
        'bower_components/angular-ui-codemirror/ui-codemirror.js',
        'bower_components/angular-marked/angular-marked.js',
        'bower_components/angular-highlightjs/angular-highlightjs.js',
        'bower_components/jszip/jszip.js',
        'bower_components/slug/slug.js',
        'bower_components/FileSaver/FileSaver.js',
        'bower_components/raml-client-generator/dist/raml-client-generator.js'
      ],
      html: ['src/index.html'],
      scss: ['src/scss/light-theme.scss', 'src/scss/dark-theme.scss'],
      scssWatch: ['src/scss/**/*.scss'],
      test: ['test/**/*.js']
    },

    connect: {
      options: {
        hostname: '0.0.0.0',
        port:     9000
      },

      livereload: {
        options: {
          livereload: true,
          open:       true,
          middleware: function (connect) {
            return [
              connect.static('dist')
            ];
          }
        }
      },

      regression: {
        options: {
          livereload: true,
          open:       false,
          middleware: function (connect) {
            return [
              connect.static('dist'),
              connect.static('test/regression/assets'),
            ];
          }
        }
      }
    },

    clean: {
      build: [
        '<%= tempdir %>',
        '<%= distdir %>'
      ]
    },

    copy: {
      assets: {
        files: [{
          dest:   '<%= distdir %>',
          cwd:    'src/assets/',
          expand: true,
          src:    [
            '**',
            '!styles/**/*'
          ]
        }]
      }
    },

    ngtemplates: {
      ramlConsole: {
        options: {
          module: 'ramlConsoleApp'
        },

        cwd:  'src/app',
        src:  '**/*.tpl.html',
        dest: '<%= tempdir %>/templates/app.js'
      }
    },

    concat: {
      app: {
        dest: '<%= distdir %>/scripts/<%= pkg.name %>.js',
        src:  [
          '<%= src.js %>',
          '<%= ngtemplates.ramlConsole.dest %>'
        ]
      },

      index: {
        options: {
          process: true
        },

        dest: '<%= distdir %>/index.html',
        src:  'src/index.html'
      },

      darkTheme: {
        options: {
          process: function process(value) {
            return value.replace(/\.raml-console-CodeMirror/g, '.CodeMirror');
          }
        },

        dest: '<%= distdir %>/styles/<%= pkg.name %>-dark-theme.css',
        src:  [
          'src/assets/styles/vendor/codemirror.css',
          'src/assets/styles/fonts.css',
          'src/assets/styles/error.css',
          '<%= distdir %>/styles/<%= pkg.name %>-dark-theme.css',
          'src/assets/styles/vendor/codemirror-dark.css'
        ]
      },

      lightTheme: {
        options: {
          process: function process(value) {
            return value.replace(/\.raml-console-CodeMirror/g, '.CodeMirror');
          }
        },

        dest: '<%= distdir %>/styles/<%= pkg.name %>-light-theme.css',
        src:  [
          'src/assets/styles/vendor/codemirror.css',
          'src/assets/styles/fonts.css',
          'src/assets/styles/error.css',
          '<%= distdir %>/styles/<%= pkg.name %>-light-theme.css',
          'src/assets/styles/vendor/codemirror-light.css'
        ]
      },

      vendor: {
        src:  '<%= src.jsVendor %>',
        dest: '<%= distdir %>/scripts/<%= pkg.name %>-vendor.js'
      }
    },

    concurrent: {
      build: [
        'build:scripts',
        'concat:vendor',
        'concat:index',
        'copy:assets',
        'build:styles'
      ],

      themes: [
        'concat:darkTheme',
        'concat:lightTheme'
      ]
    },

    sass: {
      build: {
        options: {
          sourcemap: 'none',
          style:     'expanded'
        },

        files: {
          '<%= distdir %>/styles/<%= pkg.name %>-light-theme.css': 'src/scss/light-theme.scss',
          '<%= distdir %>/styles/<%= pkg.name %>-dark-theme.css':  'src/scss/dark-theme.scss'
        }
      },

      min: {
        options: {
          sourcemap: 'none',
          style:     'compressed'
        },

        files: {
          '<%= distdir %>/styles/<%= pkg.name %>-light-theme.css': 'src/scss/light-theme.scss',
          '<%= distdir %>/styles/<%= pkg.name %>-dark-theme.css':  'src/scss/dark-theme.scss'
        }
      }
    },

    watch: {
      dist: {
        options: {
          livereload: true
        },

        tasks: [],
        files: [
          '<%= distdir %>/**/*'
        ]
      },

      scripts: {
        tasks: ['build:scripts'],
        files: [
          '<%= ngtemplates.ramlConsole.src %>',
          '<%= src.js %>'
        ]
      },

      vendor: {
        tasks: ['concat:scripts'],
        files: [
          '<%= concat.vendor.src %>'
        ]
      },

      index: {
        tasks: ['concat:index'],
        files: [
          '<%= concat.index.src %>'
        ]
      },

      styles: {
        tasks: ['build:styles'],
        files: [
          'src/scss/**/*.scss'
        ]
      },

      assets: {
        tasks: ['copy:assets'],
        files: [
          'src/assets/**/*',
          '!src/assets/styles/**/*'
        ]
      }
    },

    /*jshint camelcase: false */
    css_prefix: {
      prefix: {
        options: {
          prefix:      'raml-console-',
          processName: 'trim'
        },

        files: {
          '<%= distdir %>/styles/<%= pkg.name %>-light-theme.css': '<%= distdir %>/styles/<%= pkg.name %>-light-theme.css',
          '<%= distdir %>/styles/<%= pkg.name %>-dark-theme.css':  '<%= distdir %>/styles/<%= pkg.name %>-dark-theme.css'
        }
      }
    },
    /*jshint camelcase: true */

    jshint: {
      options: {
        jshintrc: true
      },

      files: [
        'Gruntfile.js',
        '<%= src.js %>',
        '<%= src.test %>',
        '!src/vendor/**/*.js'
      ]
    },

    protractor: {
      options: {
        keepAlive:  false
      },

      local: {
        options: {
          configFile: 'test/regression/local.protractor.conf.js'
        }
      }
    }
  });

  grunt.registerTask('default', [
    'build',
    'connect:livereload',
    'watch'
  ]);

  grunt.registerTask('build', [
    'jshint',
    'clean',
    'concurrent:build'
  ]);

  grunt.registerTask('build:scripts', [
    'ngtemplates',
    'concat:app'
  ]);

  grunt.registerTask('build:styles', [
    'sass:build',
    'css_prefix:prefix',
    'concurrent:themes'
  ]);

  grunt.registerTask('regression', [
    'connect:regression',
    'protractor:local'
  ]);
};
