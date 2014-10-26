'use strict';

var LIVERELOAD_PORT = 35729;
var resolve         = function (dir) {
  return require('path').resolve(__dirname, dir);
};

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', ['build', 'connect:livereload', 'open:server', 'watch:build']);
  grunt.registerTask('server', ['release', 'connect:livereload', 'watch:build']);
  grunt.registerTask('build', ['jshint', 'clean', 'ngtemplates', 'concat', 'copy:assets', 'clean:styles', 'sass:build', 'cssmin', 'clean:templates']);
  grunt.registerTask('release', ['jshint', 'clean', 'ngtemplates', 'concat:index', 'uglify', 'concat:codemirror', 'copy:assets', 'clean:styles', 'sass:min', 'cssmin', 'clean:templates' ]);

  grunt.initConfig({
    distdir: 'dist',
    pkg: grunt.file.readJSON('package.json'),
    src: {
      js: ['src/**/*.js'],
      jsTpl: ['<%= distdir %>/templates/**/*.js'],
      html: ['src/index.html'],
      scss: ['src/scss/light-theme.scss', 'src/scss/dark-theme.scss'],
      scssWatch: ['src/scss/**/*.scss']
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
      build: ['<%= distdir %>/*'],
      styles: ['<%= distdir %>/styles/*'],
      templates: ['<%= distdir %>/templates']
    },

    copy: {
      assets: {
        files: [{ dest: '<%= distdir %>', src : '**', expand: true, cwd: 'src/assets/' }]
      }
    },

    ngtemplates: {
      ramlConsole: {
        options: {
          module: 'ramlConsoleApp'
        },
        cwd: 'src/app',
        src: '**/*.tpl.html',
        dest: '<%= distdir %>/templates/app.js'
      }
    },

    concat:{
      dist:{
        src:['<%= src.js %>', '<%= src.jsTpl %>'],
        dest:'<%= distdir %>/scripts/<%= pkg.name %>.js'
      },
      index: {
        src: ['src/index.html'],
        dest: '<%= distdir %>/index.html',
        options: {
          process: true
        }
      },
      vendor: {
        src:['vendor/angular/angular.js', 'vendor/jquery/*.js', 'vendor/raml-parser/raml-parser.js', 'vendor/marked/marked.js', 'vendor/angular-marked/angular-marked.js', 'vendor/crypto-js/hmac-sha1.js', 'vendor/crypto-js/enc-base64.js'],
        dest: '<%= distdir %>/scripts/vendor.js'
      },
      codemirror: {
        src: ['<%= distdir %>/scripts/vendor.js', 'vendor/codemirror/codemirror.js', 'vendor/angular-codemirror/angular-codemirror.js'],
        dest: '<%= distdir %>/scripts/vendor.js'
      }
    },

    uglify: {
      dist:{
        src:['<%= src.js %>' ,'<%= src.jsTpl %>'],
        dest:'<%= distdir %>/scripts/<%= pkg.name %>.js',
        options: {
          wrap: true,
          mangle: false
        }
      },
      vendor: {
        src:['vendor/angular/angular.js', 'vendor/jquery/*.js', 'vendor/raml-parser/raml-parser.js', 'vendor/marked/marked.js', 'vendor/angular-marked/angular-marked.js', 'vendor/crypto-js/hmac-sha1.js', 'vendor/crypto-js/enc-base64.js'],
        dest: '<%= distdir %>/scripts/vendor.js',
        options: {
          mangle: true
        }
      }
    },

    sass: {
      build: {
        files: {
          '<%= distdir %>/styles/light-theme.css': 'src/scss/light-theme.scss',
          '<%= distdir %>/styles/dark-theme.css': 'src/scss/dark-theme.scss'
        },
        options: {
          style: 'expanded'
        }
      },
      min: {
        files: {
          '<%= distdir %>/styles/light-theme.css': 'src/scss/light-theme.scss',
          '<%= distdir %>/styles/dark-theme.css': 'src/scss/dark-theme.scss'
        },
        options: {
          sourcemap: 'none',
          style: 'compressed'
        }
      }
    },

    watch:{
      build: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files:['<%= src.js %>', '<%= src.scssWatch %>', 'src/app/**/*.tpl.html', '<%= src.html %>'],
        tasks:['build']
      }
    },

    cssmin: {
      vendor: {
        files: {
          '<%= distdir %>/styles/vendor.css': ['src/assets/styles/codemirror.css', 'src/assets/styles/fonts.css']
        }
      }
    },

    jshint:{
      files:['gruntFile.js', '<%= src.js %>'],
      options: {
        jshintrc: '.jshintrc'
      }
    }
  });
};
