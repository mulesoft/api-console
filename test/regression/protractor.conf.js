'use strict';

exports.config = {
  specs: [
    'test/**/*Spec.js'
  ],

  capabilities: {
    'browserName': 'chrome'
  },

  baseUrl: 'http://ec2-54-80-146-198.compute-1.amazonaws.com:8080',
  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 1000 * 60 * 60
  }
};
