'use strict';

exports.config = {
  capabilities: {
    'browserName': 'chrome'
  },

  baseUrl: 'http://localhost:3000',
  framework: 'jasmine',

  suites: {
    standalone: 'standalone/*Suite.js',
    all: '**/*Suite.js'
  },

  onPrepare: function() {
    var SpecReporter = require('jasmine-spec-reporter');
    jasmine.getEnv().addReporter(new SpecReporter({ displayStacktrace: true }));
  },

  jasmineNodeOpts: {
    silent: true
  }
};
