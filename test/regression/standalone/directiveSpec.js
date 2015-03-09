'use strict';

var assertions = require('../assertions');

module.exports = function() {
  it('should be able to diplay the API title', function () {
    // Arrange
    var assert = assertions.create('resource');

    // Act
    browser.get('http://localhost:9000/directive-minimum.html');
    // Assert
    assert.ifTitleIsPresent('Example API');
  });

  it('should be able to display resources correctly', function () {
    // Arrange
    var assert = assertions.create('resource');

    // Act
    browser.get('http://localhost:9000/directive-resources.html');

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
    browser.get('http://localhost:9000/directive-security-schemes.html');

    // Assert
    assert.ifShowingSecuritySchemes(0, 0, ['Anonymous', 'OAuth 2.0']);
  });

  it('should be able to diplay all HTTP methods', function () {
    // Arrange
    var assert = assertions.create('resource');

    // Act
    browser.get('http://localhost:9000/directive-all-methods.html');

    // Assert
    assert.ifResourceNameIsPresentAt('/resources', 0);
    assert.ifShowingDefinedMethodsForResourceAt(0, ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'TRACE', 'CONNECT']);
  });

  it('should be able to disable switch theme button', function () {
    // Arrange
    var assert = assertions.create('displaySettings');

    // Act
    browser.get('http://localhost:9000/directive-without-theme-switcher.html');

    //Assert
    assert.ifThemeSwitcherIsDisabled();
  });

  it('should be able to disable download api client button', function () {
    // Arrange
    var assert = assertions.create('displaySettings');

    // Act
    browser.get('http://localhost:9000/directive-without-download-api-client.html');

    //Assert
    assert.ifDownloadApiClientIsDisabled();
  });

  it('should be able to disable switch theme and download api client button', function () {
    // Arrange
    var assert = assertions.create('displaySettings');

    // Act
    browser.get('http://localhost:9000/directive-without-meta-button-group.html');

    //Assert
    assert.ifMetaButtonGroupIsDisabled();
  });

  it('should be able to disable title', function () {
    // Arrange
    var assert = assertions.create('displaySettings');

    // Act
    browser.get('http://localhost:9000/directive-without-title.html');

    //Assert
    assert.ifTitleIsDisabled();
  });

  it('should be able to display using single view mode', function () {
    // Arrange
    var assert = assertions.create('displaySettings');

    // Act
    browser.get('http://localhost:9000/directive-single-view.html');

    //Assert
    assert.ifDisplayingInSingleViewMode();
  });

  it('should be able to load resouces collapsed by default', function () {
    // Arrange
    var assert = assertions.create('displaySettings');

    // Act
    browser.get('http://localhost:9000/directive-with-resource-collapsed.html');

    //Assert
    assert.ifResourcesAreCollapsed();
  });
};
