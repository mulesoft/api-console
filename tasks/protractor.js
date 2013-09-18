if( !process.env.NODE_ENV ) process.env.NODE_ENV = 'test';

/**
 * This tiny wrapper file checks for node debug flags and appends them
 * when found, before invoking the real executable. Thanks to mocha for the
 * pattern.
 */

var spawn = require('child_process').spawn,
    args = [__dirname + '/../lib/cli.js'],
    path = require('path'),
    fs = require('fs');

module.exports = function(grunt) {
  var _ = grunt.util._;

  grunt.registerMultiTask('protractor', 'run protractor.', function() {
    var done = this.async();
    var options = this.options();
    var data = this.data;

    //merge options onto data, with data taking precedence
    data = _.merge(options, data);
    data.configFile = path.resolve(data.configFile);

    if (data.configFile) {
      data.configFile = grunt.template.process(data.configFile);
    }

    function runProtractor() {
      var selenium = spawn('java', ['-jar', 'selenium/selenium-server-standalone-2.35.0.jar', '-Dwebdriver.chrome.driver=./selenium/chromedriver']);

      var proc = spawn('protractor', [data.configFile], { stdio: 'inherit' });
      proc.on('exit', function (code, signal) {
        if (signal) {
          process.kill(process.pid, signal);
        } else {
          process.exit(code);
        }
      });
    }

    if (!fs.existsSync('./selenium/selenium-server-standalone-2.35.0.jar')) {
      var installProc = spawn('./node_modules/protractor/bin/install_selenium_standalone', [], { stdio: 'inherit' });

      installProc.on('exit', function (code, signal) {
        runProtractor();
      })
    }
    else {
      runProtractor();
    }
  });
}
