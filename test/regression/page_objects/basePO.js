'use strict';

var fs       = require('fs');
var path     = require('path');
var basePath = process.cwd().indexOf('regression') > 0 ? path.join(process.cwd(), 'assets') : path.join(process.cwd(), 'test/regression/assets');
var files    = fs.readdirSync(basePath);
var basePO   = {
  examples: {},
  get: function() {
    browser.get('http://localhost:3000');
  }
};

// Loading RAML examples
files.map(function (file) {
  var name = path.basename(file, '.raml');
  basePO.examples[name] = fs.readFileSync(path.join(basePath, file))
                            .toString()
                            .split('\n');
});

module.exports = basePO;
