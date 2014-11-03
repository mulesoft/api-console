'use strict';

var Server = require('./server');
var current;

exports.beforeEach = function () {
  current = new Server(3000);
  current.start();
};

exports.afterEach = function() {
  current.close();
};
