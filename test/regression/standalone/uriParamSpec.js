'use strict';

var assertions = require('../assertions');
var connect    = require('../helpers/connect');

module.exports = function() {
  beforeEach(connect.beforeEach);
  afterEach(connect.afterEach);

  it('should diplay a RAML', function () {
    // Arrange
    var assert = assertions.create('resource');

    // Act
    browser.get('http://localhost:3000?raml=http://localhost:3000/raml/minimum.raml');

    // Assert
    assert.ifTitleIsPresent('Example API');
  });

  it('should display error page if RAML is wrong', function () {
    // Arrange
    var assert = assertions.create('error');

    // Act
    browser.get('http://localhost:3000?raml=http://localhost:3000/raml/wrong.raml');

    // Assert
    assert.ifTitleIsPresent('Error while loading http://localhost:3000/raml/wrong.raml');
    assert.ifErrorMessageIsPresent('unknown property ti tle');
    assert.ifSnippetIsPresent('ti tle: Example API');
    assert.ifRamlIsPresent();
  });
};
