/* eslint-disable import/no-extraneous-dependencies */
const merge = require('deepmerge');
const slSettings = require('@advanced-rest-client/testing-karma-sl/sl-settings.js');
const createBaseConfig = require('./karma.conf.js');

module.exports = (config) => {
  const cnf = slSettings();
  cnf.sauceLabs.testName = 'api-console';
  cnf.browsers = [
    'SL_Chrome',
    'SL_Chrome-1',
    'SL_Firefox',
    'SL_Firefox-1',
    'SL_Safari',
    // 'SL_EDGE'
  ];
  if (process.env.TRAVIS) {
    const buildLabel = 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')';

    cnf.browserStack = {
      build: buildLabel,
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
    };

    cnf.sauceLabs.build = buildLabel;
    cnf.sauceLabs.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;
  }

  config.set(merge(createBaseConfig(config), cnf));

  return config;
};
