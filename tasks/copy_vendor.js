'use strict';

exports.name = 'copy';

exports.createConfig = function(context, block) {
  context.outDir = context.inDir;
  context.outFiles = context.inFiles;

  if (block.type === 'js' && /vendor/.exec(block.dest)) {
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    console.log(context);
    console.log(block);
    var cfg = {
      files: [{
        expand: true,
        dot: true,
        cwd: 'app',
        dest: 'dist/scripts/vendor',
        flatten: true,
        src: []
      }]
    };

    block.src.forEach(function(file) {
      cfg.files[0].src.push(file);
    });

    return cfg;
  } else {
    return {};
  }
};
