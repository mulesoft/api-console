'use strict';

describe('Standalone', function () {
  xdescribe('Initializer', require('./initializerSpec'));
  describe('Directive', require('./directiveSpec'));
  xdescribe('URI Parameter', require('./uriParamSpec'));
});
