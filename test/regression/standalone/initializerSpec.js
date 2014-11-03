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
    it('should diplay a RAML', function () {
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
    it('should diplay a RAML', function () {
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
