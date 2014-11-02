'use strict';

var fs       = require('fs');
var path     = require('path');
var basePath = path.join(process.cwd(), 'assets');
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
