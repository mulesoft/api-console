// Generated on 2013-07-08 using generator-angular 0.3.0
'use strict';

var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({
  port: LIVERELOAD_PORT
});
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  require('./tasks/protractor')(grunt);

  // configurable paths
  var yeomanConfig = {
    app: 'app',
    dist: 'dist'
  };

  grunt.initConfig({
    ngtemplates: {
      consoleEmbedded: {
        options: {
          base: 'app',
          module: 'ramlConsoleApp'
        },
        src: 'app/views/**.html',
        dest: 'dist/templates.js'
      }
    },

    concat: {
      embeddedMin: {
        files: {
          'dist/index.html': ['app/index.embedded.html']
        }
      },
      embedded: {
        files: {
          'dist/app.js': [
            'app/vendor/jquery.js',
            'app/vendor/vkbeautify.0.99.00.beta.js',
            'app/scripts/inspector.js',
            'app/scripts/inspector/**/*.js',
            'app/scripts/client.js',
            'app/scripts/client/auth_strategies.js',
            'app/scripts/client/**/*.js',
            'app/scripts/controllers.js',
            'app/scripts/controllers/**/*.js',
            'app/scripts/directives.js',
            'app/scripts/directives/**/*.js',
            'app/scripts/filters.js',
            'app/scripts/filters/**/*.js',
            'app/scripts/settings.js',
            'app/scripts/raml.js',
            'app/scripts/raml_console.js',
            'dist/templates.js'
          ],
          'dist/vendor.js': [
            'app/vendor/angular.js',
            'app/vendor/angular-sanitize.js',
            'app/vendor/angular-resource.js',
            'app/vendor/raml-parser.js',
            'app/vendor/showdown.min.js',
            'app/vendor/codemirror/codemirror.js',
            'app/vendor/codemirror/xml.js',
            'app/vendor/codemirror/javascript.js'
          ],
          'dist/index.html': ['app/index.acceptance.html'],
          'dist/authentication/oauth2.html': ['app/authentication/oauth2.html']
        }
      }
    },

    yeoman: yeomanConfig,
    watch: {
      less: {
        files: ['app/styles/less/**/*.less'],
        tasks: ['less']
      },
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
          '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },
    connect: {
      options: {
        port: 9000,
        hostname: 'localhost' // Change this to '0.0.0.0' to access the server from outside.
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, '.tmp'),
              mountFolder(connect, yeomanConfig.app)
            ];
          }
        }
      },
      test: {
        options: {
          port: 9001,
          middleware: function (connect) {
            return [
              mountFolder(connect, '.tmp'),
              mountFolder(connect, 'test'),
              mountFolder(connect, yeomanConfig.app)
            ];
          }
        }
      },
      dist: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, yeomanConfig.dist)
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
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      embedded: {
        src: ['dist/**/*.*']
      },
      postCompilation: {
        src: ['dist/templates.js']
      },
      server: '.tmp'
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
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/{,*/}*.js',
            '<%= yeoman.dist %>/styles/{,*/}*.css',
            '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.dist %>/styles/fonts/*'
          ]
        }
      }
    },
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>'
      }
    },
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        dirs: ['<%= yeoman.dist %>']
      }
    },
    htmlmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: ['*.html', 'views/*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },

    // Put files not handled in other tasks here
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'images/{,*/}*.{gif,webp,svg}',
            'styles/fonts/*'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/images',
          src: [
            'generated/*'
          ]
        }]
      },
      embedded: {
        files: [{
          expand: true,
          cwd: 'app/examples',
          src: ['*'],
          dest: 'dist/examples/'
        },
        {
          expand: true,
          cwd: 'app/vendor/font-awesome/font',
          src: ['*'],
          dest: 'dist/font/'
        },
        {
          expand: true,
          cwd: 'app/vendor/open-sans',
          src: ['*'],
          dest: 'dist/font/'
        }
        ]
      }
    },
    protractor: {
      scenario: {
        configFile: 'spec/scenario/support/protractor.conf.js'
      },
      debug: {
        configFile: 'spec/scenario/support/protractor.conf.js',
        debug: true
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
    },
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/*.html']
      }
    },
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>/scripts',
          src: '*.js',
          dest: '<%= yeoman.dist %>/scripts'
        }]
      }
    },
    uglify: {
      dist: {
        files: {
          '<%= yeoman.dist %>/scripts/scripts.js': [
            '<%= yeoman.dist %>/scripts/scripts.js'
          ]
        }
      },
      options: {
        mangle: false
      },

      embedded: {
        files: {
          'dist/vendor.js': [
            'app/vendor/jqueryjs',
            'app/vendor/angular.js',
            'app/vendor/angular-sanitize.js',
            'app/vendor/angular-resource.js',
            'app/vendor/raml-parser.js',
            'app/vendor/showdown.min.js',
            'app/vendor/codemirror/codemirror.js',
            'app/vendor/codemirror/xml.js',
            'app/vendor/codemirror/javascript.js',
            'app/vendor/vkbeautify.0.99.00.beta.js'
          ],
          'dist/app.js': [
            'dist/templates.js'
          ]
        }
      }
    },
    less: {
      development: {
        options: {
          paths: ['app/styles/less']

        },
        files: {
          'app/styles/main.css': 'app/styles/less/main.less'
        }
      },
      embedded: {
        options: {
          paths: ['app/styles/less']

        },
        files: {
          'dist/styles/app.css': 'app/styles/less/main.less'
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('raml-console-embedded-debug', ['clean:embedded', 'ngtemplates:consoleEmbedded', 'concat:embedded', 'copy:embedded', 'less:embedded', 'clean:postCompilation']);
  grunt.registerTask('raml-console-embedded', ['clean:embedded', 'ngtemplates:consoleEmbedded', 'concat:embeddedMin', 'uglify:embedded', 'copy:embedded', 'less:embedded', 'clean:postCompilation']);

  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'connect:livereload',
      'open',
      'watch'
    ]);
  });

  grunt.registerTask('spec', [
    'karma:unit',
    'spec:integration'
  ]);

  grunt.registerTask('spec:unit', [
    'karma:unit'
  ]);

  grunt.registerTask('spec:parser', [
    'karma:parser'
  ]);

  grunt.registerTask('spec:integration', [
    'ngtemplates',
    'karma:integration',
    'clean:postCompilation'
  ]);

  grunt.registerTask('scenario', [
    'clean:server',
    'less',
    'connect:test',
    'protractor'
  ]);

  grunt.registerTask('scenario:debug', [
    'clean:server',
    'less',
    'connect:test',
    'protractor:debug'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'useminPrepare',
    'copy',
    'cdnify',
    'ngmin',
    'uglify',
    'rev',
    'usemin',
    'less'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'test',
    'build'
  ]);

  grunt.registerTask('test', [
    'jshint',
    'spec',
    'scenario'
  ]);
};
