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
                '<%= yeoman.app %>/scripts/{,*/}*.js'
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
                configFile: 'spec/unit/support/karma.conf.js',
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
            'connect:livereload',
            'open',
            'watch'
        ]);
    });

    grunt.registerTask('spec', [
        'karma'
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
	   'spec',
       'scenario'
    ]);
};
