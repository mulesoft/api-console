'use strict';

var LIVERELOAD_PORT = 35729;
var resolve         = function (dir) {
  return require('path').resolve(__dirname, dir);
};

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', ['build', 'connect:livereload', 'open:server', 'watch:build']);
  grunt.registerTask('server', ['release', 'connect:livereload', 'watch:build']);
  grunt.registerTask('build', [
    'env:build',
    'jshint',
    'clean',
    'ngtemplates',
    'concat:app',
    'concat:index',
    'preprocess:index',
    'copy:assets',
    'copy:vendor',
    'clean:styles',
    'sass:build',
    'cssmin',
    'clean:templates'
  ]);
  grunt.registerTask('release', [
    'env:release',
    'jshint',
    'clean',
    'ngtemplates',
    'concat:index',
    'concat:vendor',
    'preprocess:index',
    'uglify',
    'copy:assets',
    'clean:styles',
    'sass:min',
    'cssmin',
    'clean:templates'
  ]);

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
      },
      vendor: {
        files: [
          { dest: '<%= distdir %>/scripts/vendor', src : 'marked.js', expand: true, cwd: 'vendor/bower_components/marked/lib/' },
          { dest: '<%= distdir %>/scripts/vendor', src : 'client-oauth2.js', expand: true, cwd: 'vendor/client-oauth2/' },
          { dest: '<%= distdir %>/scripts/vendor/raml', src : 'raml-parser.js', expand: true, cwd: 'vendor/bower_components/raml-js-parser/dist/' },
          { dest: '<%= distdir %>/scripts/vendor/raml', src : 'raml-sanitize.js', expand: true, cwd: 'vendor/raml-sanitize/' },
          { dest: '<%= distdir %>/scripts/vendor/raml', src : 'raml-validate.js', expand: true, cwd: 'vendor/raml-validate/' },
          { dest: '<%= distdir %>/scripts/vendor/jquery', src : 'jquery.js', expand: true, cwd: 'vendor/bower_components/jquery/dist/' },
          { dest: '<%= distdir %>/scripts/vendor/jquery', src : 'velocity.js', expand: true, cwd: 'vendor/bower_components/velocity/' },
          { dest: '<%= distdir %>/scripts/vendor/crypto-js', src : 'hmac-sha1.js', expand: true, cwd: 'vendor/bower_components/crypto-js/rollups/' },
          { dest: '<%= distdir %>/scripts/vendor/crypto-js', src : 'enc-base64.js', expand: true, cwd: 'vendor/bower_components/crypto-js/components/' },
          { dest: '<%= distdir %>/scripts/vendor/codemirror', src : 'codemirror.js', expand: true, cwd: 'vendor/bower_components/codemirror/lib/' },
          { dest: '<%= distdir %>/scripts/vendor/codemirror/mode', src : 'javascript.js', expand: true, cwd: 'vendor/bower_components/codemirror/mode/javascript/' },
          { dest: '<%= distdir %>/scripts/vendor/codemirror/mode', src : 'xml.js', expand: true, cwd: 'vendor/bower_components/codemirror/mode/xml/' },
          { dest: '<%= distdir %>/scripts/vendor/codemirror/mode', src : 'yaml.js', expand: true, cwd: 'vendor/bower_components/codemirror/mode/yaml/' },
          { dest: '<%= distdir %>/scripts/vendor/codemirror/addon', src : 'dialog.js', expand: true, cwd: 'vendor/bower_components/codemirror/addon/dialog/' },
          { dest: '<%= distdir %>/scripts/vendor/codemirror/addon', src : 'search.js', expand: true, cwd: 'vendor/bower_components/codemirror/addon/search/' },
          { dest: '<%= distdir %>/scripts/vendor/codemirror/addon', src : 'searchcursor.js', expand: true, cwd: 'vendor/bower_components/codemirror/addon/search/' },
          { dest: '<%= distdir %>/scripts/vendor/angular', src : 'angular.js', expand: true, cwd: 'vendor/bower_components/angular/' },
          { dest: '<%= distdir %>/scripts/vendor/angular', src : 'ui-codemirror.js', expand: true, cwd: 'vendor/bower_components/angular-ui-codemirror/' },
          { dest: '<%= distdir %>/scripts/vendor/angular', src : 'angular-marked.js', expand: true, cwd: 'vendor/bower_components/angular-marked/' }
        ]
      }
    },

    env: {
      build: {
        NODE_ENV: 'DEVELOPMENT'
      },
      release: {
        NODE_ENV: 'PRODUCTION'
      }
    },

    preprocess: {
      index: {
        src: '<%= distdir %>/index.html',
        dest: '<%= distdir %>/index.html'
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
      app:{
        src:['<%= src.js %>', '<%= src.jsTpl %>'],
        dest:'<%= distdir %>/scripts/<%= pkg.name %>.js'
      },
      index: {
        src: 'src/index.html',
        dest: '<%= distdir %>/index.html',
        options: {
          process: true
        }
      },
      vendor: {
        src: [
          'vendor/bower_components/marked/lib/marked.js',
          'vendor/client-oauth2/client-oauth2.js',
          'vendor/bower_components/raml-js-parser/dist/raml-parser.js',
          'vendor/raml-validate/raml-validate.js',
          'vendor/raml-sanitize/raml-sanitize.js',
          'vendor/bower_components/jquery/dist/jquery.min.js',
          'vendor/bower_components/velocity/velocity.min.js',
          'vendor/bower_components/crypto-js/rollups/hmac-sha1.js',
          'vendor/bower_components/crypto-js/components/enc-base64-min.js',
          'vendor/codemirror/codemirror.min.js',
          'vendor/bower_components/angular/angular.min.js',
          'vendor/bower_components/angular-ui-codemirror/ui-codemirror.min.js',
          'vendor/bower_components/angular-marked/angular-marked.min.js'
        ],
        dest:'<%= distdir %>/scripts/vendor.js'
      }
    },

    uglify: {
      app:{
        src: ['<%= src.js %>' ,'<%= src.jsTpl %>'],
        dest: '<%= distdir %>/scripts/<%= pkg.name %>.js',
        options: {
          wrap: true,
          mangle: false
        }
      },
      vendor: {
        src: '<%= distdir %>/scripts/vendor.js',
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
