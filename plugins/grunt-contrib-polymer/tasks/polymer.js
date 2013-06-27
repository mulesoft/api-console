module.exports = function (grunt) {
    var path = require('path');

    grunt.registerMultiTask('polymer', 'polymer build', function () {
        var buffer = [],
            resourceReader = function (src, basedir, extension) {
                var file = null,
                    filepath, componentName;

                if (null !== src) {
                    filepath = src[1];

                    if (grunt.file.exists(filepath)) {
                        file = grunt.file.read(filepath);
                    } else {
                        filepath = path.join(path.dirname(basedir), filepath);

                        if (grunt.file.exists(filepath)) {
                            file = grunt.file.read(filepath);
                        } else {
                            grunt.log.warn('Source file "' + filepath + '" not found.');
                        }
                    }
                } else {
                    componentName = path.basename(basedir, '.html') + extension;
                    filepath = path.join(path.dirname(basedir), componentName);

                    if (grunt.file.exists(filepath)) {
                        file = grunt.file.read(filepath);
                    } else {
                        grunt.log.warn('Source file "' + filepath + '" not found.');
                    }
                }

                return file;
            },
            resourceResolver = function (src, elements, code, regex) {
                if (null !== elements) {
                    temp = elements[0];

                    src = src.replace(temp, temp + code);
                    src = src.replace('src="' + elements[1] + '"', '');
                } else {
                    temp = regex.exec(src);
                    src = src.replace(temp, temp + code);
                }

                return src;
            };


        this.files.forEach(function (f) {
            f.src.filter(function (filepath) {
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else {
                    return true;
                }
            }).map(function (filepath) {
                var src = grunt.file.read(filepath),
                    styleSrc = /<style.*?src="(.*?)">/gi.exec(src),
                    scriptSrc = /<script.*?src="(.*?)">/gi.exec(src),
                    style = resourceReader(styleSrc, filepath, '.css'),
                    script = resourceReader(scriptSrc, filepath, '.js'),
                    temp;

                src = resourceResolver(src, styleSrc, style, /<style.*?>/gi);
                src = resourceResolver(src, scriptSrc, script, /<script.*?>/gi);

                buffer.push(src);
            });
        });

        try {
            grunt.file.write(this.data.dest, buffer.join(''));

            grunt.log.ok('File ' + this.data.dest + ' created.');
        } catch (e) {
            grunt.log.error(e);
        }
    });
};