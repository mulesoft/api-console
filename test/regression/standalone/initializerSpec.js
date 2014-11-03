'use strict';

var url     = require('url');
var factory = require('../page_objects');

module.exports = function() {
  it('should be displayed', function() {
    // Arrange
    var po = factory.create('initializer');

    // Act
    po.get();

    // Assert
    expect(po.ramlPathInput.isPresent()).toBe(true);
    expect(po.ramlEditor.isPresent()).toBe(true);
    expect(po.loadRamlFromUrlBtn.isPresent()).toBe(true);
    expect(po.loadRamlBtn.isPresent()).toBe(true);
  });

  describe('Load from URL', function () {
    it('should diplay a RAML', function () {
      // Arrange
      var po          = factory.create('initializer');
      var resourcesPO = factory.create('resources');

      // Act
      po.get();
      po.setRamlPath(url.resolve(browser.baseUrl, '/minimum.raml'));
      po.loadRamlFromUrl();

      // Assert
      expect(resourcesPO.title.isPresent()).toBe(true);
      expect(resourcesPO.getTitle()).toBe('Example API');
    });

    it('should display error page if RAML is wrong', function () {
      // Arrange
      var po      = factory.create('initializer');
      var errorPO = factory.create('error');

      // Act
      po.get();
      po.setRamlPath(url.resolve(browser.baseUrl, '/wrong.raml'));
      po.loadRamlFromUrl();

      // Assert
      expect(errorPO.title.isPresent()).toBe(true);
      expect(errorPO.getTitle()).toBe('Error while loading http://localhost:3000/wrong.raml');

      expect(errorPO.errorMessage.isPresent()).toBe(true);
      expect(errorPO.getErrorMessage()).toBe('unknown property ti tle');

      expect(errorPO.errorSnippet.isPresent()).toBe(true);
      expect(errorPO.getErrorSnippet()).toBe('ti tle: Example API');

      errorPO.getRaml().then(function (value) {
        var expected = po.examples.minimum.join('').replace(/ /g, '');

        value = value.split('\n').join('').replace(/ /g, '');

        expect(value).toBe(expected);
      });
    });
  });

  describe('Load from RAML text', function () {
    it('should diplay a RAML', function () {
      // Arrange
      var po          = factory.create('initializer');
      var resourcesPO = factory.create('resources');

      // Act
      po.get();
      po.setRaml(po.examples.minimum);
      po.loadRaml();

      // Assert
      expect(resourcesPO.title.isPresent()).toBe(true);
      expect(resourcesPO.getTitle()).toBe('Example API');
    });

    it('should display error page if RAML is wrong', function () {
      // Arrange
      var po      = factory.create('initializer');
      var errorPO = factory.create('error');

      // Act
      po.get();
      po.setRaml(po.examples.wrong);
      po.loadRaml();

      // Assert
      expect(errorPO.title.isPresent()).toBe(true);
      expect(errorPO.getTitle()).toBe('Error while loading');

      expect(errorPO.errorMessage.isPresent()).toBe(true);
      expect(errorPO.getErrorMessage()).toBe('unknown property ti tle');

      expect(errorPO.errorSnippet.isPresent()).toBe(true);
      expect(errorPO.getErrorSnippet()).toBe('ti tle: Example API');

      errorPO.getRaml().then(function (value) {
        var expected = po.examples.minimum.join('').replace(/ /g, '');

        value = value.split('\n').join('').replace(/ /g, '');

        expect(value).toBe(expected);
      });
    });
  });
};
