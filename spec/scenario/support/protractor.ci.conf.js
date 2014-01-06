// An example configuration file.
exports.config = {
  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'firefox'
  },

  // Spec patterns are relative to the location of the spec file. They may
  // include glob patterns.
  specs: [
    '../../matchers/**/*.js',
    '../../support/helpers/**/*.js',
    'helpers/**/*.js',
    '../**/*_scenario.js'
  ],

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true, // Use colors in the command line report.
    defaultTimeoutInterval: 20000
  }
};
