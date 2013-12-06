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
          module: 'ramlConsoleApp'
        },
        cwd: 'app',
        src: 'views/**.html',
        dest: '.tmp/templates.js'
      },
      test: {
        options: {
          module: 'ramlConsoleApp'
        },
        cwd: 'app',
        src: 'views/**.html',
        dest: 'dist/templates.js' // FIXME: put this into a test directory
      }
    },
    cssmin: {
      dist: {
        files: {
          '<%= yeoman.dist %>/styles/app.min.css': [
            '<%= yeoman.dist %>/styles/app.min.css'
          ]
        },
        options: {
          keepSpecialComments: '0'
        }
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
              mountFolder(connect, 'app/vendor/bower_components/font-awesome/font'),
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
              mountFolder(connect, 'app/vendor/bower_components/font-awesome/font'),
              mountFolder(connect, 'app/vendor/open-sans'),
              mountFolder(connect, yeomanConfig.app)
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
            '<%= yeoman.dist %>/scripts/*.min.js',
            '<%= yeoman.dist %>/styles/*.min.css'
          ]
        }
      }
    },
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>',
        flow: {
          steps: {
            js: [require('./tasks/copy_vendor'), 'concat', 'uglifyjs'],
            css: ['concat', 'cssmin'],
          },
          post: {}
        }
      }
    },
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        dirs: ['<%= yeoman.dist %>']
      }
    },
    concat: {
      addTemplate: {
        src: [ '.tmp/concat/scripts/app.min.js', '.tmp/templates.js' ],
        dest: '.tmp/concat/scripts/app.min.js'
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
            'authentication/oauth1.html',
            'authentication/oauth2.html'
          ]
        },
        {
          expand: true,
          cwd: 'app/vendor/bower_components/font-awesome/font',
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
      backupOriginal: {
        files: [{
          expand: true,
          cwd: '.tmp/concat',
          dest: '<%= yeoman.dist %>',
          src: ['scripts/*.min.js', 'styles/*.min.css'],
          rename: function(dest, src) {
            var regex = /(.*)\.min(.*)/;
            return dest + '/' + src.replace(regex, '$1$2');
          }
        }]
      }
    },
    protractor: {
      scenario: {
        configFile: 'spec/scenario/support/protractor.<%= process.env.TRAVIS ? "ci" : "dev"%>.conf.js'
      },
      debug: {
        configFile: 'spec/scenario/support/protractor.dev.conf.js',
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
    uglify: {
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
          'dist/styles/app.min.css': 'app/styles/less/app.less'
        }
      }
    }

  });

  var linted = false;

  grunt.registerTask('lint', function() {
    if (!linted) {
      linted = true;
      grunt.task.run(['jshint']);
    }
  });

  grunt.registerTask('server', [
    'clean:server',
    'less:development',
    'connect:livereload',
    'open',
    'watch'
  ]);

  grunt.registerTask('spec', [
    'lint',
    'karma:unit',
    'spec:integration'
  ]);

  grunt.registerTask('spec:unit', [
    'lint',
    'karma:unit'
  ]);

  grunt.registerTask('spec:parser', [
    'karma:parser'
  ]);

  grunt.registerTask('spec:integration', [
    'lint',
    'ngtemplates:test',
    'karma:integration',
    'clean:postCompilation'
  ]);

  grunt.registerTask('scenario', [
    'lint',
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
    'less:dist',
    'concat:generated',
    'concat:addTemplate',
    'copy:dist',
    'copy:generated',
    'copy:backupOriginal',
    'uglify',
    'cssmin',
    'rev',
    'usemin',
    'clean:postCompilation'
  ]);

  grunt.registerTask('default', [
    'lint',
    'test',
    'build'
  ]);

  grunt.registerTask('test', [
    'lint',
    'spec',
    'scenario'
  ]);
};
