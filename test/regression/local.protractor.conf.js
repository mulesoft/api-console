'use strict';

exports.config = {
  seleniumPort: 4444,

  allScriptsTimeout: 120000,

  capabilities: {
    'browserName': 'firefox'
  },

  baseUrl: 'http://localhost:9000',
  framework: 'jasmine',

  suites: {
    standalone: 'standalone/*Suite.js',
    all: '**/*Suite.js'
  },

  onPrepare: function() {
    var SpecReporter = require('jasmine-spec-reporter');
    jasmine.getEnv().addReporter(new SpecReporter({ displayStacktrace: false }));
  },

  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 120000,
    isVerbose: false,
    includeStackTrace: false
  }
};
