'use strict';

describe('Standalone', function () {
  describe('Initializer', require('./initializerSpec'));
  describe('Directive', require('./directiveSpec'));
  describe('URI Parameter', require('./uriParamSpec'));
});
