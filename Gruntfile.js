module.exports = function (grunt) {
    var path = require('path');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        dirs: {
            libs: ['app/scripts/libs/*.js'],
            showdown: ['app/vendor/showdown.min.js'],
            helpers: ['app/scripts/libs/helpers.js']
        },

        polymer: {
            development: {
                src: 'dist/compiled/app/components/**/*.html',
                dest: 'dist/raml.html'
            }
        },

        concat: {
            development: {
                files: {
                    'dist/compiled/app/components/api-definition/api-definition.js': ['<%= dirs.helpers %>', 'app/components/api-definition/api-definition.js'],
                    'dist/compiled/app/components/api-console/api-console.js': ['app/components/api-console/api-console.js'],
                    'dist/compiled/app/components/api-documentation/api-documentation.js': ['<%= dirs.showdown %>', 'app/components/api-documentation/api-documentation.js'],
                    'dist/compiled/app/components/api-console-navbar/api-console-navbar.js': ['app/components/api-console-navbar/api-console-navbar.js'],
                    'dist/compiled/app/components/api-console-sidebar/api-console-sidebar.js': ['app/components/api-console-sidebar/api-console-sidebar.js'],
                    'dist/compiled/app/components/api-operation/api-operation.js': ['app/components/api-operation/api-operation.js'],
                    'dist/compiled/app/components/api-operation-list/api-operation-list.js': ['app/components/api-operation-list/api-operation-list.js'],
                    'dist/compiled/app/components/api-operation-details/api-operation-details.js': ['app/components/api-operation-details/api-operation-details.js'],
                    'dist/compiled/app/components/api-operation-details-section-parameters/api-operation-details-section-parameters.js': ['app/components/api-operation-details-section-parameters/api-operation-details-section-parameters.js'],
                    'dist/compiled/app/components/api-operation-details-section-request/api-operation-details-section-request.js': ['app/components/api-operation-details-section-request/api-operation-details-section-request.js'],
                    'dist/compiled/app/components/api-operation-details-section-response/api-operation-details-section-response.js': ['app/components/api-operation-details-section-response/api-operation-details-section-response.js'],
                    'dist/compiled/app/components/api-operation-details-section-try-it/api-operation-details-section-try-it.js': ['<%= dirs.helpers %>', 'app/components/api-operation-details-section-try-it/api-operation-details-section-try-it.js']
                }
            }
        },

        less: {
            development: {
                options: {
                    paths: ["app/styles"]
                },
                files: {
                    "dist/compiled/app/components/api-console/api-console.css": "app/components/api-console/api-console.less",
                    "dist/compiled/app/components/api-documentation/api-documentation.css": "app/components/api-documentation/api-documentation.less",
                    "dist/compiled/app/components/api-console-navbar/api-console-navbar.css": "app/components/api-console-navbar/api-console-navbar.less",
                    "dist/compiled/app/components/api-console-sidebar/api-console-sidebar.css": "app/components/api-console-sidebar/api-console-sidebar.less",
                    "dist/compiled/app/components/api-operation/api-operation.css": "app/components/api-operation/api-operation.less",
                    "dist/compiled/app/components/api-operation-list/api-operation-list.css": "app/components/api-operation-list/api-operation-list.less",
                    "dist/compiled/app/components/api-operation-details/api-operation-details.css": "app/components/api-operation-details/api-operation-details.less",
                    "dist/compiled/app/components/api-operation-details-section-parameters/api-operation-details-section-parameters.css": "app/components/api-operation-details-section-parameters/api-operation-details-section-parameters.less",
                    "dist/compiled/app/components/api-operation-details-section-request/api-operation-details-section-request.css": "app/components/api-operation-details-section-request/api-operation-details-section-request.less",
                    "dist/compiled/app/components/api-operation-details-section-response/api-operation-details-section-response.css": "app/components/api-operation-details-section-response/api-operation-details-section-response.less",
                    "dist/compiled/app/components/api-operation-details-section-try-it/api-operation-details-section-try-it.css": "app/components/api-operation-details-section-try-it/api-operation-details-section-try-it.less"
                }
            }
        },

        clean: {
            development: {
                src: ['dist/**/*.*']
            },
            postCompilation: {
                src: ['dist/compiled/**']
            }
        },

        copy: {
            development: {
                files: [{
                        expand: true,
                        flatten: true,
                        filter: 'isFile',
                        src: ['app/vendor/raml-parser.js', 'app/vendor/polymer.min.js', 'app/vendor/polymer.min.js.map', 'app/index.html', 'app/sandbox/instagram.yml', 'app/sandbox/twitter.yml'],
                        dest: 'dist/'
                    }, {
                        src: ['app/components/**/*.html', 'app/components/**/*.css'],
                        dest: 'dist/compiled/'
                    }, {
                        src: ['app/sandbox/instagram-v1/**/*.*'],
                        dest: 'dist/'
                    }
                ]
            }
        },

        watch: {
            options: {
                livereload: 35729
            },
            javascript: {
                files: ['app/scripts/**/*.js', 'app/styles/**/*.less', 'app/components/**/*.*', 'app/sandbox/instagram.yml'],
                tasks: ['build']
            }
        },

        connect: {
            website: {
                options: {
                    port: 9001,
                    base: 'dist'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.task.loadTasks('plugins/grunt-contrib-polymer/tasks');

    grunt.registerTask('build', ['clean:development', 'copy:development', 'concat:development', 'less:development', 'polymer:development', 'clean:postCompilation']);
    grunt.registerTask('raml', ['build', 'connect:website', 'watch']);
};