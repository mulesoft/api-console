'use strict';

var LIVERELOAD_PORT = 35729;
var resolve         = function (dir) {
  return require('path').resolve(__dirname, dir);
};

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', [/*'jshint',*/ 'build', 'connect:livereload', 'open:server', 'watch:build']);
  grunt.registerTask('build', ['clean', 'ngtemplates', 'concat', 'sass:build', 'copy:assets']);
  grunt.registerTask('release', ['clean', 'ngtemplates', 'uglify', 'jshint', 'karma:unit', 'concat:index', 'sass:min', 'copy:assets']);

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

    clean: ['<%= distdir %>/*'],

    copy: {
      assets: {
        files: [{ dest: '<%= distdir %>', src : '**', expand: true, cwd: 'src/assets/' }]
      }
    },

    ngtemplates: {
      ramlConsole: {
        options: {
          module: 'ramlConsole'
        },
        cwd: 'src/app',
        src: '**/*.tpl.html',
        dest: '<%= distdir %>/templates/app.js'
      }
    },

    concat:{
      dist:{
        src:['<%= src.js %>', '<%= src.jsTpl %>'],
        dest:'<%= distdir %>/scripts/<%= pkg.name %>.js',
        options: {
          banner: "(function() { \n 'use strict';\n\n",
          footer: "})();"
        }
      },
      index: {
        src: ['src/index.html'],
        dest: '<%= distdir %>/index.html',
        options: {
          process: true
        }
      },
      vendor: {
        src:['vendor/angular/angular.js', 'vendor/jquery/*.js', 'vendor/raml-parser/raml-parser.js'],
        dest: '<%= distdir %>/scripts/vendor.js'
      }
    },

    uglify: {
      dist:{
        options: {
          banner: "<%= banner %>"
        },
        src:['<%= src.js %>' ,'<%= src.jsTpl %>'],
        dest:'<%= distdir %>/<%= pkg.name %>.js'
      },
      vendor: {
        src:['vendor/angular/angular.js', 'vendor/jquery/*.js', 'vendor/raml-parser/raml-parser.js'],
        dest: '<%= distdir %>/scripts/vendor.js'
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

    jshint:{
      files:['gruntFile.js', '<%= src.js %>', '<%= src.jsTpl %>'],
      options:{
        curly:true,
        eqeqeq:true,
        immed:true,
        latedef:true,
        newcap:true,
        noarg:true,
        sub:true,
        boss:true,
        eqnull:true,
        globals:{}
      }
    }
  });

};
