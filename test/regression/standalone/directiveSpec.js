'use strict';

var Server     = require('../helpers/server');
var assertions = require('../assertions');

module.exports = function() {
  it('should be able to diplay the API title', function () {
    // Arrange
    var server = new Server(3001, 'minimum.raml', 'directive.tpl.html');
    var assert = assertions.create('resource');

    // Act
    server.start();
    browser.get('http://localhost:3001');

    // Assert
    assert.ifTitleIsPresent('Example API');
  });

  it('should be able to display resources correctly', function () {
    // Arrange
    var server = new Server(3004, 'resources.raml', 'directive.tpl.html');
    var assert = assertions.create('resource');

    // Act
    server.start();
    browser.get('http://localhost:3004');

    // Assert
    assert.ifResourceNameIsPresentAt('/resource1', 0);
    assert.ifNestedResourceNameIsPresentAt('/resource1/nested', 1);
    assert.ifNestedResourceNameIsPresentAt('/resource1/nested/{id}', 2);
    assert.ifNestedResourceNameIsPresentAt('/resource1/nested/{id}/nested', 3);
    assert.ifResourceNameIsPresentAt('/resource2', 4);
  });

  it('should be able to diplay all HTTP methods', function () {
    // Arrange
    var server = new Server(3003, 'all-methods.raml', 'directive.tpl.html');
    var assert = assertions.create('resource');

    // Act
    server.start();
    browser.get('http://localhost:3003');

    // Assert
    assert.ifResourceNameIsPresentAt('/resources', 0);
    assert.ifShowingDefinedMethodsForResourceAt(0, ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'TRACE', 'CONNECT']);
  });

  it('should display error page if RAML is wrong', function () {
    // Arrange
    var server = new Server(3002, 'wrong.raml', 'directive.tpl.html');
    var assert = assertions.create('error');

    // Act
    server.start();
    browser.get('http://localhost:3002');

    // Assert
    assert.ifTitleIsPresent('Error while loading http://localhost:3002/raml/wrong.raml');
    assert.ifErrorMessageIsPresent('unknown property ti tle');
    assert.ifSnippetIsPresent('ti tle: Example API');
    assert.ifRamlIsPresent();
  });
};
