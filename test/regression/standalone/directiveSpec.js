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

  // TODO: unskip test when null security scheme is supported by the parser.
  xit('should be able to display security schemes', function () {
    // Arrange
    var assert = assertions.create('resource');

    // Act
    browser.get('http://localhost:9000/directive-security-schemes.html');

    // Assert
    assert.ifShowingSecuritySchemes(0, 0, ['Anonymous', 'OAuth 2.0']);
  });

  it('should be able to display security schemes with grants', function () {
    // Arrange
    var assert = assertions.create('resource');

    // Act
    browser.get('http://localhost:9000/directive-security-schemes-grants.html');

    // Asserts
    assert.ifShowingSecuritySchemes(0, 0, ['OAuth 2.0']);
    assert.ifShowingGrants(0, 0, ['Implicit', 'Authorization Code']);
  });

  // TODO: check if this feature must be supported.
  xit('should be able to cache credentials between resources', function () {
    // Arrange
    var assert = assertions.create('resource');

    // Act
    browser.get('http://localhost:9000/directive-security-schemes-basic.html');
    assert.ifCredentialsUpdateBetweenResources();
  });

  // TODO: unskip test when all HTTP methods are supported by the parser.
  xit('should be able to diplay all HTTP methods', function () {
    // Arrange
    var assert = assertions.create('resource');

    // Act
    browser.get('http://localhost:9000/directive-all-methods.html');

    // Assert
    assert.ifResourceNameIsPresentAt('/resources', 0);
    assert.ifShowingDefinedMethodsForResourceAt(0, ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'TRACE', 'CONNECT']);
  });

  it('should be able to display form parameters', function () {
    // Arrange
    var assert = assertions.create('resource');

    // Act
    browser.get('http://localhost:9000/directive-form-parameters.html');

    // Asserts
    assert.ifShowingFormParameters(0, 0, 2, ['AWSAccessKeyId', 'acl', 'file']);
  });

  it('should be able to display query parameters', function () {
    // Arrange
    var assert = assertions.create('resource');

    // Act
    browser.get('http://localhost:9000/directive-query-parameters.html');

    // Asserts
    assert.ifShowingQueryParameters(0, 0, 0, ['page', 'per_page']);
  });

  it('should be able to display headers', function () {
    // Arrange
    var assert = assertions.create('resource');

    // Act
    browser.get('http://localhost:9000/directive-headers.html');

    // Asserts
    assert.ifShowingHeaders(0, 0, 1, ['Authorization', 'ZEncoder API Key']);
  });

  it('should be able to display base uri parameters', function () {
    // Arrange
    var assert = assertions.create('resource');

    // Act
    browser.get('http://localhost:9000/directive-base-uri-parameters.html');

    // Asserts
    assert.ifShowingBaseUriParameters(0, 0, 0, ['Community Domain', 'Community Path']);
  });

  it('should be able to display uri parameters', function () {
    // Arrange
    var assert = assertions.create('resource');

    // Act
    browser.get('http://localhost:9000/directive-uri-parameters.html');

    // Asserts
    assert.ifShowingUriParameters(0, 0, 0, ['Community Domain', 'mediaTypeExtension', 'path']);
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
