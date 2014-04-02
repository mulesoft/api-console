// Karma configuration

// base path, that will be used to resolve files and exclude
basePath = '../../..';

// list of files / patterns to load in the browser
files = [
    JASMINE,
    JASMINE_ADAPTER,
    'app/vendor/bower_components/raml-js-parser/dist/raml-parser.js',
    'app/vendor/bower_components/crypto-js/rollups/hmac-sha1.js',
    'app/vendor/bower_components/crypto-js/components/enc-base64.js',
    'app/vendor/bower_components/angular/angular.js',
    'app/vendor/jquery.js',
    'app/vendor/bower_components/angular-mocks/angular-mocks.js',
    'app/vendor/bower_components/angular-sanitize/angular-sanitize.js',
    'app/vendor/bower_components/showdown/src/showdown.js',
    'app/vendor/bower_components/showdown/src/extensions/table.js',
    'app/vendor/bower_components/codemirror/lib/codemirror.js',
    'app/vendor/bower_components/codemirror/mode/xml/xml.js',
    'app/vendor/bower_components/codemirror/mode/javascript/javascript.js',
    'app/vendor/bower_components/vkbeautify/vkbeautify.js',
    'app/scripts/client.js',
    'app/scripts/client/**/*.js',
    'app/scripts/controllers.js',
    'app/scripts/controllers/**/*.js',
    'app/scripts/directives.js',
    'app/scripts/directives/**/*.js',
    'app/scripts/filters.js',
    'app/scripts/filters/**/*.js',
    'app/scripts/inspector.js',
    'app/scripts/inspector/**/*.js',
    'app/scripts/services.js',
    'app/scripts/services/**/*.js',
    'app/scripts/raml.js',
    'app/scripts/settings.js',
    'app/scripts/utils.js',
    'app/scripts/raml_console.js',
    '.tmp/templates.js',
    'spec/matchers/**/*.js',
    'spec/support/helpers/**/*.js',
    'spec/integration/support/jasmine-jquery.js',
    'spec/integration/support/jquery.mockjax.js',
    'spec/integration/support/helpers/**/*.js',
    'spec/integration/**/*_spec.js'
];

// list of files to exclude
exclude = [];

// test results reporter to use
// possible values: dots || progress || growl
reporters = ['progress'];

// web server port
port = 8081;

// cli runner port
runnerPort = 9101;

// enable / disable colors in the output (reporters and logs)
colors = true;

// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;

// enable / disable watching file and executing tests whenever any file changes
autoWatch = true;

// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
browsers = ['PhantomJS'];

// If browser does not capture in given timeout [ms], kill it
captureTimeout = 5000;

// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = true;
