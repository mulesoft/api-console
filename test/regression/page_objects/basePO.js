'use strict';

var fs       = require('fs');
var path     = require('path');
var basePath = process.cwd().indexOf('regression') > 0 ? path.join(process.cwd(), 'assets/raml') : path.join(process.cwd(), 'test/regression/assets/raml');
var files    = fs.readdirSync(basePath);
var basePO   = {
  examples: {}
};

// Loading RAML examples
files.map(function (file) {
  var name = path.basename(file, '.raml');
  basePO.examples[name] = fs.readFileSync(path.join(basePath, file))
                            .toString()
                            .split('\n');
});

module.exports = basePO;
