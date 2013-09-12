// Generated on 2013-07-08 using generator-angular 0.3.0
'use strict';
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({
    port: LIVERELOAD_PORT
});
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var yeomanConfig = {
        app: 'app',
        dist: 'dist'
    };

    try {
        yeomanConfig.app = require('./bower.json').appPath || yeomanConfig.app;
    } catch (e) {}

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
                        'app/scripts/app.js',
                        'app/scripts/services/raml-service.js',
                        'app/scripts/services/raml-parser.js',
                        'app/scripts/services/helpers.js',
                        'app/scripts/services/showdown.js',
                        'app/scripts/services/event-service.js',
                        'app/scripts/directives/prevent-default.js',
                        'app/scripts/directives/raml-console.js',
                        'app/scripts/directives/raml-definition.js',
                        'app/scripts/directives/markdown.js',
                        'app/scripts/filters/filters.js',
                        'app/scripts/controllers/raml-operation.js',
                        'app/scripts/controllers/raml-operation-list.js',
                        'app/scripts/controllers/raml-documentation.js',
                        'app/scripts/controllers/raml-console-sidebar.js',
                        'app/scripts/controllers/raml-operation-details.js',
                        'app/scripts/controllers/raml-operation-details-try-it.js',
                        'app/scripts/controllers/raml-operation-details-response.js',
                        'app/scripts/controllers/raml-operation-details-request.js',
                        'dist/templates.js'
                    ],
                    'dist/vendor.js': [
                        'app/vendor/angular.js',
                        'app/vendor/angular-sanitize.js',
                        'app/vendor/angular-resource.js',
                        'app/vendor/raml-parser.js',
                        'app/vendor/showdown.min.js'
                    ],
                    'dist/index.html': ['app/index.embedded.html']
                }
            }
        },

        yeoman: yeomanConfig,
        watch: {
            coffee: {
                files: ['<%= yeoman.app %>/scripts/{,*/}*.coffee'],
                tasks: ['coffee:dist']
            },
            coffeeTest: {
                files: ['test/spec/{,*/}*.coffee'],
                tasks: ['coffee:test']
            },
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
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: 'localhost'
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
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, 'test')
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
                '<%= yeoman.app %>/scripts/{,*/}*.js'
            ]
        },
        coffee: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/scripts',
                    src: '{,*/}*.coffee',
                    dest: '.tmp/scripts',
                    ext: '.js'
                }]
            },
            test: {
                files: [{
                    expand: true,
                    cwd: 'test/spec',
                    src: '{,*/}*.coffee',
                    dest: '.tmp/spec',
                    ext: '.js'
                }]
            }
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
        cssmin: {
            // By default, your `index.html` <!-- Usemin Block --> will take care of
            // minification. This option is pre-configured if you do not wish to use
            // Usemin blocks.
            // dist: {
            //   files: {
            //     '<%= yeoman.dist %>/styles/main.css': [
            //       '.tmp/styles/{,*/}*.css',
            //       '<%= yeoman.app %>/styles/{,*/}*.css'
            //     ]
            //   }
            // }
        },
        htmlmin: {
            dist: {
                options: {
                    /*removeCommentsFromCDATA: true,
          // https://github.com/yeoman/grunt-usemin/issues/44
          //collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true*/
                },
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
                        'bower_components/**/*',
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
                    src: ['app/def/traits-tester.yaml'],
                    dest: 'dist/'
                }]
            }
        },
        concurrent: {
            server: [
                'coffee:dist'
            ],
            test: [
                'coffee'
            ],
            dist: [
                'coffee',
                'htmlmin'
            ]
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                autoWatch: true
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
                        'app/vendor/angular.js',
                        'app/vendor/angular-sanitize.js',
                        'app/vendor/angular-resource.js',
                        'app/vendor/raml-parser.js',
                        'app/vendor/showdown.min.js'
                    ],
                    'dist/app.js': [
                        'app/scripts/app.js',
                        'app/scripts/services/raml-service.js',
                        'app/scripts/services/raml-parser.js',
                        'app/scripts/services/helpers.js',
                        'app/scripts/services/showdown.js',
                        'app/scripts/services/event-service.js',
                        'app/scripts/directives/prevent-default.js',
                        'app/scripts/directives/raml-console.js',
                        'app/scripts/directives/raml-definition.js',
                        'app/scripts/directives/markdown.js',
                        'app/scripts/filters/filters.js',
                        'app/scripts/controllers/raml-operation.js',
                        'app/scripts/controllers/raml-operation-list.js',
                        'app/scripts/controllers/raml-documentation.js',
                        'app/scripts/controllers/raml-console-sidebar.js',
                        'app/scripts/controllers/raml-operation-details.js',
                        'app/scripts/controllers/raml-operation-details-try-it.js',
                        'app/scripts/controllers/raml-operation-details-response.js',
                        'app/scripts/controllers/raml-operation-details-request.js',
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
                    'dist/app.css': 'app/styles/less/main.less'
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
            'concurrent:server',
            'connect:livereload',
            'open',
            'watch'
        ]);
    });

    grunt.registerTask('test', [
        'clean:server',
        'concurrent:test',
        'connect:test',
        'karma'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'useminPrepare',
        'concurrent:dist',
        // 'concat',
        'copy',
        'cdnify',
        'ngmin',
        //'cssmin',
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
};
