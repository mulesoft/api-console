'use strict';

var factory    = require('../page_objects');
var connect    = require('../helpers/connect');
var assertions = require('../assertions');

module.exports = function() {
  beforeEach(connect.beforeEach);
  afterEach(connect.afterEach);

  it('should be displayed', function() {
    // Arrange
    var po = factory.create('initializer');

    // Act
    browser.get('http://localhost:3000');

    // Assert
    expect(po.ramlPathInput.isPresent()).toBe(true);
    expect(po.ramlEditor.isPresent()).toBe(true);
    expect(po.loadRamlFromUrlBtn.isPresent()).toBe(true);
    expect(po.loadRamlBtn.isPresent()).toBe(true);
  });

  describe('Load from URL', function () {
    it('should be able to diplay the API title', function () {
      // Arrange
      var po     = factory.create('initializer');
      var assert = assertions.create('resource');

      // Act
      browser.get('http://localhost:3000');
      po.setRamlPath('http://localhost:3000/raml/minimum.raml');
      po.loadRamlFromUrl();

      // Assert
      assert.ifTitleIsPresent('Example API');
    });

    it('should be able to display resources correctly', function () {
      // Arrange
      var po     = factory.create('initializer');
      var assert = assertions.create('resource');

      // Act
      browser.get('http://localhost:3000');
      po.setRamlPath('http://localhost:3000/raml/resources.raml');
      po.loadRamlFromUrl();

      // Assert
      assert.ifResourceNameIsPresentAt('/resource1', 0);
      assert.ifNestedResourceNameIsPresentAt('/resource1/nested', 1);
      assert.ifNestedResourceNameIsPresentAt('/resource1/nested/{id}', 2);
      assert.ifNestedResourceNameIsPresentAt('/resource1/nested/{id}/nested', 3);
      assert.ifResourceNameIsPresentAt('/resource2', 4);
    });

    it('should be able to diplay all HTTP methods', function () {
      // Arrange
      var po     = factory.create('initializer');
      var assert = assertions.create('resource');

      // Act
      browser.get('http://localhost:3000');
      po.setRamlPath('http://localhost:3000/raml/all-methods.raml');
      po.loadRamlFromUrl();

      // Assert
      assert.ifResourceNameIsPresentAt('/resources', 0);
      assert.ifShowingDefinedMethodsForResourceAt(0, ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'TRACE', 'CONNECT']);
    });

    it('should display error page if RAML is wrong', function () {
      // Arrange
      var po     = factory.create('initializer');
      var assert = assertions.create('error');

      // Act
      browser.get('http://localhost:3000');
      po.setRamlPath('http://localhost:3000/raml/wrong.raml');
      po.loadRamlFromUrl();

      // Assert
      assert.ifTitleIsPresent('Error while loading http://localhost:3000/raml/wrong.raml');
      assert.ifErrorMessageIsPresent('unknown property ti tle');
      assert.ifSnippetIsPresent('ti tle: Example API');
      assert.ifRamlIsPresent();
    });
  });

  describe('Load from RAML text', function () {
    it('should be able to diplay the API title', function () {
      // Arrange
      var po     = factory.create('initializer');
      var assert = assertions.create('resource');

      // Act
      browser.get('http://localhost:3000');
      po.setRaml(po.examples.minimum);
      po.loadRaml();

      // Assert
      assert.ifTitleIsPresent('Example API');
    });

    it('should be able to display resources correctly', function () {
      // Arrange
      var po     = factory.create('initializer');
      var assert = assertions.create('resource');

      // Act
      browser.get('http://localhost:3000');
      po.setRaml(po.examples.resources);
      po.loadRaml();

      // Assert
      assert.ifResourceNameIsPresentAt('/resource1', 0);
      assert.ifNestedResourceNameIsPresentAt('/resource1/nested', 1);
      assert.ifNestedResourceNameIsPresentAt('/resource1/nested/{id}', 2);
      assert.ifNestedResourceNameIsPresentAt('/resource1/nested/{id}/nested', 3);
      assert.ifResourceNameIsPresentAt('/resource2', 4);
    });

    it('should be able to diplay all HTTP methods', function () {
      // Arrange
      var po     = factory.create('initializer');
      var assert = assertions.create('resource');

      // Act
      browser.get('http://localhost:3000');
      po.setRaml(po.examples['all-methods']);
      po.loadRaml();

      // Assert
      assert.ifResourceNameIsPresentAt('/resources', 0);
      assert.ifShowingDefinedMethodsForResourceAt(0, ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'TRACE', 'CONNECT']);
    });

    it('should display error page if RAML is wrong', function () {
      // Arrange
      var po     = factory.create('initializer');
      var assert = assertions.create('error');

      // Act
      browser.get('http://localhost:3000');
      po.setRaml(po.examples.wrong);
      po.loadRaml();

      // Assert
      assert.ifTitleIsPresent('Error while loading');
      assert.ifErrorMessageIsPresent('unknown property ti tle');
      assert.ifSnippetIsPresent('ti tle: Example API');
      assert.ifRamlIsPresent();
    });
  });
};
