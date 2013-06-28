module.exports = function (grunt) {
    var path = require('path');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        dirs: {
            libs: ['app/scripts/libs/*.js']
        },

        polymer: {
            development: {
                src: 'dist/compiled/app/components/**/*.html',
                dest: 'dist/heaven.html'
            }
        },

        concat: {
            development: {
                files: {
                    'dist/compiled/app/components/api-definition/api-definition.js': ['<%= dirs.libs %>', 'app/components/api-definition/api-definition.js'],
                    'dist/compiled/app/components/api-console/api-console.js': ['<%= dirs.libs %>', 'app/components/api-console/api-console.js'],
                    'dist/compiled/app/components/api-console-navbar/api-console-navbar.js': ['<%= dirs.libs %>', 'app/components/api-console-navbar/api-console-navbar.js'],
                    'dist/compiled/app/components/api-console-sidebar/api-console-sidebar.js': ['<%= dirs.libs %>', 'app/components/api-console-sidebar/api-console-sidebar.js'],
                    'dist/compiled/app/components/api-operation/api-operation.js': ['<%= dirs.libs %>', 'app/components/api-operation/api-operation.js'],
                    'dist/compiled/app/components/api-operation-details/api-operation-details.js': ['<%= dirs.libs %>', 'app/components/api-operation-details/api-operation-details.js'],
                    'dist/compiled/app/components/api-operation-details-section-parameters/api-operation-details-section-parameters.js': ['<%= dirs.libs %>', 'app/components/api-operation-details-section-parameters/api-operation-details-section-parameters.js'],
                    'dist/compiled/app/components/api-operation-details-section-request/api-operation-details-section-request.js': ['<%= dirs.libs %>', 'app/components/api-operation-details-section-request/api-operation-details-section-request.js'],
                    'dist/compiled/app/components/api-operation-details-section-response/api-operation-details-section-response.js': ['<%= dirs.libs %>', 'app/components/api-operation-details-section-response/api-operation-details-section-response.js'],
                    'dist/compiled/app/components/api-operation-details-section-try-it/api-operation-details-section-try-it.js': ['<%= dirs.libs %>', 'app/components/api-operation-details-section-try-it/api-operation-details-section-try-it.js']
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
                    "dist/compiled/app/components/api-console-navbar/api-console-navbar.css": "app/components/api-console-navbar/api-console-navbar.less",
                    "dist/compiled/app/components/api-console-sidebar/api-console-sidebar.css": "app/components/api-console-sidebar/api-console-sidebar.less",
                    "dist/compiled/app/components/api-operation/api-operation.css": "app/components/api-operation/api-operation.less",
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
                        src: ['app/vendor/polymer.min.js', 'app/vendor/polymer.min.js.map', 'app/index.html', 'app/sandbox/instagram.json'],
                        dest: 'dist/'
                    }, {
                        src: ['app/components/**/*.html', 'app/components/**/*.css'],
                        dest: 'dist/compiled/'
                    }
                ]
            }
        },

        watch: {
            options: {
                livereload: 35729
            },
            javascript: {
                files: ['app/scripts/**/*.js', 'app/styles/**/*.less', 'app/components/**/*.*'],
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