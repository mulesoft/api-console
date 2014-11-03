'use strict';

var connect = require('../helpers/connect');

describe('Standalone', function () {
  beforeEach(connect.beforeEach);
  afterEach(connect.afterEach);

  describe('Initializer', require('./initializerSpec'));
});
