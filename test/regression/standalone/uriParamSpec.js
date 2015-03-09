'use strict';

var assertions = require('../assertions');

module.exports = function() {

  it('should be able to diplay the API title', function () {
    // Arrange
    var assert = assertions.create('resource');

    // Act
    browser.get('http://localhost:9000?raml=http://localhost:9000/raml/minimum.raml');

    // Assert
    assert.ifTitleIsPresent('Example API');
  });

  it('should be able to display resources correctly', function () {
    // Arrange
    var assert = assertions.create('resource');

    // Act
    browser.get('http://localhost:9000?raml=http://localhost:9000/raml/resources.raml');

    // Assert
    assert.ifResourceNameIsPresentAt('/resource1', 0);
    assert.ifNestedResourceNameIsPresentAt('/resource1/nested', 1);
    assert.ifNestedResourceNameIsPresentAt('/resource1/nested/{id}', 2);
    assert.ifNestedResourceNameIsPresentAt('/resource1/nested/{id}/nested', 3);
    assert.ifResourceNameIsPresentAt('/resource2', 4);
  });

  it('should be able to display security schemes', function () {
    // Arrange
    var assert = assertions.create('resource');

    // Act
    browser.get('http://localhost:9000?raml=http://localhost:9000/raml/security-schemes.raml');

    // Assert
    assert.ifShowingSecuritySchemes(0, 0, ['Anonymous', 'OAuth 2.0']);
  });

  it('should be able to diplay all HTTP methods', function () {
    // Arrange
    var assert = assertions.create('resource');

    // Act
    browser.get('http://localhost:9000?raml=http://localhost:9000/raml/all-methods.raml');

    // Assert
    assert.ifResourceNameIsPresentAt('/resources', 0);
    assert.ifShowingDefinedMethodsForResourceAt(0, ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'TRACE', 'CONNECT']);
  });
};
