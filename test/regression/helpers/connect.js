'use strict';

var serveStatic = require('serve-static');
var connect     = require('connect');
var app         = connect();
var http        = require('http');
var server;

exports.beforeEach = function () {
  if (process.cwd().indexOf('regression') > 0) {
    app.use(serveStatic('assets'));
    app.use(serveStatic('../../dist'));
  } else {
    app.use(serveStatic('test/regression/assets'));
    app.use(serveStatic('dist'));
  }

  server = http.createServer(app);
  server.listen(3000);
};

exports.afterEach = function() {
  server.close();
};
