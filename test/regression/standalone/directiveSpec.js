'use strict';

var assertions = require('../assertions');
var factory    = require('../page_objects');

module.exports = function() {

  it('should be able to display errors for wrong raml', function () {
    // Arrange
    var assert = assertions.create('error');

    // Act
    browser.get('http://localhost:9000/directive-wrong.html');

    // Assert
    assert.ifErrorMessageIsPresent('Api contains errors.');
  });

  it('should be able to display the API title', function () {
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

  it('should be able to try it with security schema Pass Through', function () {
    // Arrange
    var assert = assertions.create('resource');

    // Act
    browser.get('http://localhost:9000/directive-security-schema-pass-though.html');

    // Assert
    assert.ifBeAbleToTryIt(0, 0);
  });

  it('should be able to display schema responses information', function () {
    // Arrange
    var assert = assertions.create('resource');
    var resourcePo = factory.create('resource');

    // Act
    browser.get('http://localhost:9000/directive-security-schema-pass-though.html');

    resourcePo.toggleResourceMethod(0, 0);

    // Assert
    assert.ifShowsResponseSchemaExample(0, '{\n' +
      '  "status": "denied"\n' +
      '}');
  });

  it('should be able to display security schemes', function () {
    // Arrange
    var assert = assertions.create('resource');

    // Act
    browser.get('http://localhost:9000/directive-security-schemes.html');

    // Assert
    assert.ifShowingSecuritySchemes(0, 0, ['Anonymous', 'OAuth 2.0']);
  });

  it('should be able to display security schemagit status headers', function () {
    // Arrange
    var assert = assertions.create('resource');

    // Act
    browser.get('http://localhost:9000/directive-security-schema-resource.html');

    // Assert
    assert.ifShowingSecuritySchemaHeaders(0, 0, 4, ['Authorization', '400', '401', '403']);
  });

  it('should be able to cache credentials between resources', function () {
    // Arrange
    var assert = assertions.create('resource');

    // Act
    browser.get('http://localhost:9000/directive-security-schemes-basic.html');
    assert.ifCredentialsUpdateBetweenResources();
  });


  it('should be able to display all HTTP methods', function () {
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

  it('should show response examples', function () {
    // Arrange
    var assert     = assertions.create('resource');
    var resourcePo = factory.create('resource');

    // Act
    browser.get('http://localhost:9000/directive-with-reponse-examples.html');

    resourcePo.toggleResourceMethod(0, 0);

    // Assert
    assert.ifShowsResponseExample(0, '{\n' +
      '  "name": "John",\n' +
      '  "lastName": "Smith",\n' +
      '  "title": "Developer"\n' +
      '}');
  });

  it('should show request url in try it panel', function () {
    // Arrange
    var assert     = assertions.create('resource');
    var resourcePo = factory.create('resource');

    // Act
    browser.get('http://localhost:9000/directive-query-parameters.html');

    resourcePo.toggleResourceMethod(0, 0);

    // Assert
    assert.ifShowsRequestUrl(0, 'http://localhost/resource?display=false&type=lalala&active=true');
  });

  it('should be able to open and close a resource', function () {
    // Arrange
    var assert     = assertions.create('resource');
    var resourcePo = factory.create('resource');

    // Act
    browser.get('http://localhost:9000/directive-resources.html');

    //Open method
    resourcePo.toggleResourceMethod(0, 0);
    assert.ifMethodIsOpen(0, true);

    //Close method
    resourcePo.toggleResourceMethod(0, 0);
    assert.ifMethodIsOpen(0, false);

    //Open method
    resourcePo.toggleResourceMethod(0, 0);
    assert.ifMethodIsOpen(0, true);

    //Close method with close button
    resourcePo.toggleCloseMethod(0, 0);
    assert.ifMethodIsOpen(0, false);

    //Open method
    resourcePo.toggleResourceMethod(0, 0);
    assert.ifMethodIsOpen(0, true);

    //Close method
    resourcePo.toggleResourceMethod(0, 0);
    assert.ifMethodIsOpen(0, false);
  });

  it('should preserve query parameters order', function () {
    // Arrange
    var assert     = assertions.create('resource');
    var resourcePo = factory.create('resource');

    // Act
    browser.get('http://localhost:9000/directive-query-parameters.html');

    resourcePo.toggleResourceMethod(0, 0);

    assert.ifShowingQueryParametersInCorrectOrder(0, ['display', 'type', 'other', 'page', 'active']);
  });

  it('should preserve properties order in root types', function () {
    // Arrange
    var assert     = assertions.create('resource');
    var resourcePo = factory.create('resource');

    // Act
    browser.get('http://localhost:9000/directive-types.html');

    resourcePo.toggleRootTypes();

    assert.ifShowingTypesPropertiesInCorrectOrder(0, ['c', 'a', 'b']);
  });

  it('should display query parameters description', function () {
    // Arrange
    var assert     = assertions.create('resource');
    var resourcePo = factory.create('resource');

    // Act
    browser.get('http://localhost:9000/external-library.html');

    resourcePo.toggleResourceMethod(1, 0);

    var description = 'brand name like BBW VSS LZA';
    assert.ifShowingParametersDescription(1, [description, description, description]);
  });

  describe('should display form body fields', function () {
    it('should display properties for raml 1.0', function () {
      // Arrange
      var assert     = assertions.create('resource');
      var resourcePo = factory.create('resource');

      // Act
      browser.get('http://localhost:9000/directive-resource-bodies-10.html');

      resourcePo.toggleResourceMethod(1, 0);

      //Assert
      assert.ifDisplayingProperties(1, ['one', 'two'], ['file', 'string']);
      assert.ifDisplayingDocumentationBodyProperties(1, ['one', 'two'], ['file', 'string']);
      assert.ifDisplayingPropertyExample(1, 'two', 'blah');
    });

    it('should display properties inheriting from root types for raml 1.0', function () {
      // Arrange
      var assert     = assertions.create('resource');
      var resourcePo = factory.create('resource');

      // Act
      browser.get('http://localhost:9000/directive-resource-bodies-10.html');

      resourcePo.toggleResourceMethod(2, 0);

      //Assert
      assert.ifDisplayingProperties(2, ['one', 'two'], ['file', 'string']);
      assert.ifDisplayingDocumentationBodyProperties(2, ['one', 'two'], ['userPicture', 'userName']);
      assert.ifDisplayingPropertyExample(2, 'two', 'blah');
    });

    it('should display type inheriting from root types for raml 1.0', function () {
      // Arrange
      var assert     = assertions.create('resource');
      var resourcePo = factory.create('resource');

      // Act
      browser.get('http://localhost:9000/directive-resource-bodies-10.html');

      resourcePo.toggleResourceMethod(3, 0);

      //Assert
      assert.ifDisplayingProperties(3, ['one', 'two'], ['file', 'string']);
      assert.ifDisplayingDocumentationBodyProperties(3, ['one', 'two'], ['file', 'string']);
    });

    it('should display type and properties for raml 1.0', function () {
      // Arrange
      var assert     = assertions.create('resource');
      var resourcePo = factory.create('resource');

      // Act
      browser.get('http://localhost:9000/directive-resource-bodies-10.html');

      resourcePo.toggleResourceMethod(4, 0);

      //Assert
      assert.ifDisplayingProperties(4, ['one', 'three', 'two'], ['file', 'string', 'string']);
      assert.ifDisplayingDocumentationBodyProperties(4, ['one', 'two', 'three'], ['file', 'string', 'string']);
    });

    it('should display formParameters for raml 0.8', function () {
      // Arrange
      var assert     = assertions.create('resource');
      var resourcePo = factory.create('resource');

      // Act
      browser.get('http://localhost:9000/directive-resource-bodies-08.html');

      resourcePo.toggleResourceMethod(0, 0);

      //Assert
      assert.ifDisplayingProperties(0, ['one', 'two'], ['file', 'string']);
    });

    it('should display description for all resources', function () {
      // Arrange
      var assert = assertions.create('resource');

      // Act
      browser.get('http://localhost:9000/descriptions.html');

      //Assert
      assert.ifDisplayingDescription(0, 'Product');
      assert.ifDisplayingDescription(1, 'Get Product by ID');
      assert.ifDisplayingDescription(2, 'Get Product Info');
    });

    it('should display urls in description for all resources', function () {
      // Arrange
      var assert = assertions.create('resource');

      // Act
      browser.get('http://localhost:9000/descriptions.html');

      //Assert
      assert.ifDisplayingDescriptionUrl(0, 'http://getproduct');
      assert.ifDisplayingDescriptionUrl(1, 'http://getproductbyid');
      assert.ifDisplayingDescriptionUrl(2, 'http://getproductinfo');
    });

    it('should display root description', function () {
      // Arrange
      var assert = assertions.create('resource');

      // Act
      browser.get('http://localhost:9000/descriptions.html');

      //Assert
      assert.ifDisplayingRootDescription('Product API');
    });
  });
};
