module.exports = function (grunt) {
    var path = require('path');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        dirs: {
            libs: ['app/scripts/libs/*.js']
        },

        polymer: {
            development: {
                src: 'app/components/**/*.html',
                dest: 'dist/heaven.html'
            }
        },

        concat: {
            development: {
                files: {
                    'app/components/api-operation/api-operation.js': ['<%= dirs.libs %>', 'app/scripts/components/api-operation.js'],
                    'app/components/api-operation-details/api-operation-details.js': ['<%= dirs.libs %>', 'app/scripts/components/api-operation-details.js'],
                    'app/components/api-operation-details-section-parameters/api-operation-details-section-parameters.js': ['<%= dirs.libs %>', 'app/scripts/components/api-operation-details-section-parameters.js'],
                    'app/components/api-operation-details-section-request/api-operation-details-section-request.js': ['<%= dirs.libs %>', 'app/scripts/components/api-operation-details-section-request.js'],
                    'app/components/api-operation-details-section-response/api-operation-details-section-response.js': ['<%= dirs.libs %>', 'app/scripts/components/api-operation-details-section-response.js'],
                    'app/components/api-operation-details-section-try-it/api-operation-details-section-try-it.js': ['<%= dirs.libs %>', 'app/scripts/components/api-operation-details-section-try-it.js']
                }
            }
        },

        less: {
            development: {
                options: {
                    paths: ["app/styles"]
                },
                files: {
                    "app/components/api-operation/api-operation.css": "app/styles/api-operation.less",
                    "app/components/api-operation-details/api-operation-details.css": "app/styles/api-operation-details.less",
                    "app/components/api-operation-details-section-parameters/api-operation-details-section-parameters.css": "app/styles/api-operation-details-section-parameters.less",
                    "app/components/api-operation-details-section-request/api-operation-details-section-request.css": "app/styles/api-operation-details-section-request.less",
                    "app/components/api-operation-details-section-response/api-operation-details-section-response.css": "app/styles/api-operation-details-section-response.less",
                    "app/components/api-operation-details-section-try-it/api-operation-details-section-try-it.css": "app/styles/api-operation-details-section-try-it.less"
                }
            }
        },

        clean: {
            development: {
                src: ['dist/*.*', 'app/components/**/*.js', 'app/components/**/*.css']
            }
        },

        copy: {
            development: {
                files: [{
                        expand: true,
                        flatten: true,
                        filter: 'isFile',
                        src: ['app/vendor/polymer.min.js', 'app/vendor/polymer.min.js.map', 'app/index.html'],
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
                files: ['app/scripts/**/*.js', 'app/styles/**/*.less', 'app/components/**/*.html'],
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

    grunt.registerTask('build', ['clean:development', 'copy:development', 'concat:development', 'less:development', 'polymer:development']);
    grunt.registerTask('heaven', ['build', 'connect:website', 'watch']);
};