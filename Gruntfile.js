'use strict';

var LIVERELOAD_PORT = 35729;
var lrSnippet       = require('connect-livereload')({
  port: LIVERELOAD_PORT
});

var resolve = function (dir) {
  return require('path').resolve(__dirname, dir);
};

module.exports = function (grunt) {
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);
  require('./tasks/protractor')(grunt);

  // configurable paths
  var yeomanConfig = {
    app:  'app',
    dist: 'dist'
  };

  grunt.initConfig({
    yeoman: yeomanConfig,

    ngtemplates: {
      ramlConsoleApp: {
        options: {
          module: 'ramlConsoleApp'
        },

        cwd: 'app',
        src: 'views/**.html',
        dest: '.tmp/templates.js'
      }
    },

    watch: {
      less: {
        files: ['app/styles/**/*.less'],
        tasks: ['less-and-autoprefixer']
      },

      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },

        files: [
          '<%= yeoman.app %>/**/*.html',
          '{.tmp,<%= yeoman.app %>}/styles/**/*.css',
          '{.tmp,<%= yeoman.app %>}/scripts/**/*.js',
          '<%= yeoman.app %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    less: {
      '.tmp/styles/app.css': 'app/styles/app.less'
    },

    autoprefixer: {
      options: {
        browsers: ['last 2 versions']
      },

      files: [
        '.tmp/styles/app.css'
      ]
    },

    connect: {
      options: {
        hostname: '0.0.0.0',
        port:     9000
      },

      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              connect.static(resolve('.tmp')),
              connect.static(resolve(yeomanConfig.app)),
              connect.static(resolve('dist'))
            ];
          }
        }
      },

      test: {
        options: {
          port: 9001,
          middleware: function (connect) {
            return [
              connect.static(resolve('.tmp')),
              connect.static(resolve('test')),
              connect.static(resolve(yeomanConfig.app)),
              connect.static(resolve('dist'))
            ];
          }
        }
      }
    },

    open: {
      server: {
        url: 'http://localhost:<%= connect.options.port %>'
      }
    },

    clean: {
      tmp: [
        '.tmp'
      ],

      dist: [
        '<%= yeoman.dist %>'
      ]
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },

      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/scripts/**/*.js'
      ]
    },

    useminPrepare: {
      options: {
        dest: '<%= yeoman.dist %>',
        flow: {
          steps: {
            js:  [require('./tasks/copy_vendor'), 'concat'],
            css: ['concat']
          },
          post: {}
        }
      },

      html: '<%= yeoman.app %>/index.html'
    },

    usemin: {
      options: {
        dirs: [
          '.tmp',
          '<%= yeoman.dist %>'
        ]
      },

      html: ['<%= yeoman.dist %>/**/*.html'],

      css: ['<%= yeoman.dist %>/styles/**/*.css']
    },

    concat: {
      templates: {
        src:  ['<%= yeoman.dist %>/scripts/app.js', '.tmp/templates.js'],
        dest: '<%= yeoman.dist %>/scripts/app.js'
      }
    },

    uglify: {
      options: {
        mangle: false
      },

      '<%= yeoman.dist %>/scripts/app.min.js': '<%= yeoman.dist %>/scripts/app.js',
      '<%= yeoman.dist %>/scripts/vendor.min.js': '<%= yeoman.dist %>/scripts/vendor.js'
    },

    cssmin: {
      options: {
        keepSpecialComments: '0'
      },

      '<%= yeoman.dist %>/styles/app.min.css': '<%= yeoman.dist %>/styles/app.css'
    },

    copy: {
      dist: {
        files: [
          {
            expand: true,
            dot:    true,
            cwd:    '<%= yeoman.app %>',
            dest:   '<%= yeoman.dist %>',
            src:    [
              'index.html',
              'examples/*',
              'authentication/oauth1.html',
              'authentication/oauth2.html'
            ]
          },
          {
            expand: true,
            cwd:    'app/vendor/bower_components/font-awesome/fonts',
            src:    '*',
            dest:   'dist/fonts/'
          },
          {
            expand: true,
            cwd:    'app/vendor/open-sans',
            src:    '*',
            dest:   'dist/fonts/'
          }
        ]
      }
    },

    protractor: {
      scenario: {
        configFile: 'spec/scenario/support/protractor.<%= process.env.TRAVIS ? "ci" : "dev"%>.conf.js'
      },

      debug: {
        configFile: 'spec/scenario/support/protractor.dev.conf.js',
        debug:      true
      }
    },

    karma: {
      unit: {
        configFile: 'spec/unit/support/karma.conf.js'
      },

      parser: {
        configFile: 'spec/parser/support/karma.conf.js'
      },

      integration: {
        configFile: 'spec/integration/support/karma.conf.js'
      }
    }
  });

  grunt.registerTask('jshint-smart', (function () {
    var jshinted = false;
    return function () {
      if (!jshinted) {
        jshinted = true;
        grunt.task.run(['jshint']);
      }
    };
  })());

  grunt.registerTask('less-and-autoprefixer', [
    'less',
    'autoprefixer'
  ]);

  grunt.registerTask('server', [
    'copy:dist',
    'less-and-autoprefixer',
    'connect:livereload',
    'open',
    'watch'
  ]);

  grunt.registerTask('spec', [
    'jshint-smart',
    'karma:unit',
    'spec:integration'
  ]);

  grunt.registerTask('spec:unit', [
    'jshint-smart',
    'karma:unit'
  ]);

  grunt.registerTask('spec:parser', [
    'karma:parser'
  ]);

  grunt.registerTask('spec:integration', [
    'jshint-smart',
    'ngtemplates',
    'karma:integration'
  ]);

  grunt.registerTask('scenario', [
    'jshint-smart',
    'less-and-autoprefixer',
    'connect:test',
    'protractor:scenario'
  ]);

  grunt.registerTask('scenario:debug', [
    'jshint-smart',
    'less-and-autoprefixer',
    'connect:test',
    'protractor:debug'
  ]);

  grunt.registerTask('build', [
    'jshint-smart',
    'clean',
    'useminPrepare',
    'ngtemplates',
    'less-and-autoprefixer',
    'concat:generated',
    'concat:templates',
    'copy:dist',
    'copy:generated',
    'uglify',
    'cssmin',
    'usemin'
  ]);

  grunt.registerTask('test', [
    'jshint-smart',
    'spec',
    'scenario'
  ]);

  grunt.registerTask('default', [
    'jshint-smart',
    'test',
    'build'
  ]);
};
