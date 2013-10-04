// Karma configuration

// base path, that will be used to resolve files and exclude
basePath = '../../..';

// list of files / patterns to load in the browser
files = [
    JASMINE,
    JASMINE_ADAPTER,
    'app/vendor/raml-parser.js',
    'spec/integration/support/jquery.js',
    'app/vendor/angular.js',
    'app/vendor/angular-resource.js',
    'app/vendor/angular-sanitize.js',
    'app/vendor/showdown.min.js',
    'app/vendor/codemirror/codemirror.js',
    'app/vendor/codemirror/xml.js',
    'app/vendor/codemirror/javascript.js',
    'app/scripts/**/*.js',
    'dist/templates.js',
    'spec/integration/support/angular-mocks.js',
    'spec/matchers/**/*.js',
    'spec/support/helpers/**/*.js',
    'spec/integration/support/jasmine-jquery.js',
    'spec/integration/support/helpers/**/*.js',
    'spec/integration/**/*_spec.js'
];

// list of files to exclude
exclude = [];

// test results reporter to use
// possible values: dots || progress || growl
reporters = ['progress'];

// web server port
port = 8080;

// cli runner port
runnerPort = 9100;

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
