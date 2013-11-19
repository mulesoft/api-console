// Generated on 2013-07-08 using generator-angular 0.3.0
'use strict';

var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({
  port: LIVERELOAD_PORT
});
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};
function stripFontPathPrefix(connect) {
  return function(req, res, next) {
    var pathname = connect.utils.parseUrl(req).pathname;
    var fontPrefix = '/font';
    if (pathname.slice(0, fontPrefix.length) === fontPrefix) {
      req.url = req.url.slice(fontPrefix.length);
    }
    next();
  };
}

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
      dist: {
        options: {
          base: 'app',
          module: 'ramlConsoleApp',
          concat: 'dist/scripts/app.js'
        },
        src: 'app/views/**.html',
        dest: 'dist/templates.js'
      },
      test: {
        options: {
          base: 'app',
          module: 'ramlConsoleApp'
        },
        src: 'app/views/**.html',
        dest: 'dist/templates.js' // FIXME: put this into a test directory
      }
    },

    yeoman: yeomanConfig,
    watch: {
      less: {
        files: ['app/styles/less/**/*.less'],
        tasks: ['less:development']
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
              // For dist, fonts are copied to dist/font/ and hosted at /font
              // For dev, strip /font from path and host fonts at root
              stripFontPathPrefix(connect),
              mountFolder(connect, 'app/vendor/font-awesome/font'),
              mountFolder(connect, 'app/vendor/open-sans'),
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
              stripFontPathPrefix(connect),
              mountFolder(connect, 'app/vendor/font-awesome/font'),
              mountFolder(connect, 'app/vendor/open-sans'),
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
            '<%= yeoman.dist %>/styles/{,*/}*.css'
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

    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            'index.html',
            'examples/*',
            'authentication/oauth2.html'
          ]
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
        }]
      },
      unrev: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          dest: '<%= yeoman.dist %>',
          src: ['scripts/*.*.js', 'styles/*.*.css'],
          rename: function(dest, src) {
            var regex = /[0-9a-f]{8}\.(.*)/;
            return dest + '/' + src.replace(regex, '$1');
          }
        }]
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
      }
    },
    less: {
      development: {
        options: {
          paths: ['app/styles/less']
        },
        files: {
          'app/styles/app.css': 'app/styles/less/app.less'
        }
      },
      dist: {
        options: {
          paths: ['app/styles/less']
        },
        files: {
          'dist/styles/app.css': 'app/styles/less/app.less'
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'less:development',
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
    'ngtemplates:test',
    'karma:integration',
    'clean:postCompilation'
  ]);

  grunt.registerTask('scenario', [
    'clean:server',
    'less:development',
    'connect:test',
    'protractor'
  ]);

  grunt.registerTask('scenario:debug', [
    'clean:server',
    'less:development',
    'connect:test',
    'protractor:debug'
  ]);

  grunt.registerTask('build', [
    'clean',
    'useminPrepare',
    'ngtemplates:dist',
    'concat',
    'copy:dist',
    'less:dist',
    'rev',
    'copy:unrev',
    'usemin',
    'clean:postCompilation'
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
