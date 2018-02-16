'use strict';

var factory = require('../page_objects');

function Resource (poName) {
  this.po = factory.create(poName);

  this.ifTitleIsPresent = function (title) {
    expect(this.po.title.isPresent()).toBe(true);
    expect(this.po.getTitle()).toBe(title);
  };

  this.ifResourceNameIsPresentAt = function (name, index) {
    expect(this.po.getResourceElementAt(index).isPresent()).toBe(true);
    expect(this.po.getResourceTitleAt(index)).toBe(name);
  };

  this.ifNestedResourceNameIsPresentAt = function (name, index) {
    expect(this.po.getNestedResourceElementAt(index).isPresent()).toBe(true);
    expect(this.po.getNestedResourceTitleAt(index)).toBe(name);
  };

  this.ifShowingDefinedMethodsForResourceAt = function (index, methods) {
    var methodsCount = this.po.getMethodsForResourceAt(index).count();
    var that         = this;

    expect(methodsCount).toBe(9);

    methodsCount.then(function (count) {
      for(var i = 0; i < count; i++) {
        expect(that.po.getMethodTitleAt(index, i)).toBe(methods[i]);
      }
    });
  };

  this.ifBeAbleToTryIt = function (resource, method) {
    var button = this.po.getMethodBtn(resource, method);
    var schemes, securitySchemesCount;

    button.click();

    schemes              = this.po.getSecuritySchemes(resource);
    securitySchemesCount = schemes.count();
    expect(securitySchemesCount).toBe(1);


    this.po.getTryItGetBtn(resource).click();

    var errorMessages = this.po.getTryItErrorMessages(resource);
    expect(errorMessages.count()).toBe(2);
    expect(errorMessages.get(0).isDisplayed()).toBe(false);
    expect(errorMessages.get(1).isDisplayed()).toBe(true);
  };

  this.ifShowingSecuritySchemes = function (resource, method, expectedSchemes) {
    var button = this.po.getMethodBtn(resource, method);
    var schemes, securitySchemesCount;

    button.click();

    schemes              = this.po.getSecuritySchemes(resource);
    securitySchemesCount = schemes.count();

    expect(securitySchemesCount).toBe(2);

    securitySchemesCount.then(function (count) {
      for (var i = 0; i < count; i++) {
        expect(schemes.get(i).getAttribute('innerHTML')).toBe(expectedSchemes[i]);
      }
    });
  };

  this.ifShowingSecuritySchemaHeaders = function (resource, method, expectedNOfHeaders, expectedHeaders) {
    var button = this.po.getMethodBtn(resource, method);
    button.click();

    var headers = this.po.getSecuritySchemeHeaderTitles(resource);
    var numberOfHeaders = headers.count();

    expect(numberOfHeaders).toBe(expectedNOfHeaders);
    for(var i = 0; i < expectedHeaders.length; i++) {
      expect(headers.get(i).getAttribute('innerHTML')).toContain(expectedHeaders[i]);
    }
  };

  this.ifCredentialsUpdateBetweenResources = function () {
    var resourcesGetButton= this.po.getMethodBtn(0, 0);
    var pageObject = this.po;

    var userText = 'test';
    var passwordText = 'pass';

    //click Get on /resources and set the user/pass
    resourcesGetButton.click();

    var username = pageObject.getUsernameField();
    username.sendKeys(userText);
    var password = pageObject.getPasswordField();
    password.sendKeys(passwordText);

    //close button to ensure 'resource2' is on screen.
    var closeButton = pageObject.getCloseBtn(0);
    closeButton.click();

    var resources2GetButton = pageObject.getMethodBtn(1, 0);

    //click Get on /resources2 and ensure user/pass match
    resources2GetButton.click();

    var username2 = pageObject.getUsernameField();
    expect(username2.getAttribute('value')).toBe(userText);
    var password2 = pageObject.getPasswordField();
    expect(password2.getAttribute('value')).toBe(passwordText);

  };

  this.ifShowingDefaultValueInQueryParameter = function (resource, method, queryParameterPosition) {
    var button = this.po.getMethodBtn(resource, method);
    button.click();

    var queryParameters = this.po.getQueryParametersDetail(resource);
    var queryParameter  = queryParameters.get(queryParameterPosition);

    expect(queryParameter.getText()).toMatch(/default: false/);
  };

  this.ifShowingQueryParametersInCorrectOrder = function (resource, queryParametersName) {
    var queryParameters = this.po.getQueryParametersDetail(resource);

    queryParametersName.forEach(function(name, index) {
      var queryParameter  = queryParameters.get(index);
      expect(queryParameter.getText()).toContain(name);
    });
  };

  this.ifShowingParametersDescription = function (resource, queryParametersDescription) {
    var queryParameters = this.po.getQueryParametersDescription(resource);

    queryParametersDescription.forEach(function(description, index) {
      var queryParameter  = queryParameters.get(index);
      expect(queryParameter.getText()).toContain(description);
    });
  };

  this.ifShowingTypesPropertiesInCorrectOrder = function (type, queryParametersName) {
    this.po.toggleRootType(type);

    var properties = this.po.getTypeProperties();

    queryParametersName.forEach(function(name, index) {
      var queryParameter  = properties.get(index + 1);
      expect(queryParameter.getText()).toContain(name);
    });
  };

  this.ifTryItShowsParamExample = function (resource, queryParameterPosition, defaultValue) {
    var input = this.po.getTryItQueryParameterInput(resource, queryParameterPosition);

    expect(input.getAttribute('value')).toEqual(defaultValue);
  };

  this.ifShowsResponseExample = function (resource, expectedValue) {
    var examples = this.po.getResponseExamples(resource);

    expect(examples.getText()).toEqual(expectedValue);
  };

  this.ifShowsResponseSchemaExample = function (resource, expectedValue) {
    var examples = this.po.getResponseSchemaExamples(resource);

    expect(examples.getText()).toEqual(expectedValue);
  };

  this.ifShowsRequestUrl = function (resource, expectedValue) {
    var request = this.po.getRequestUrl(resource);
    expect(request.getText()).toEqual(expectedValue);
  };

  this.ifMethodIsOpen = function (resource, isOpen) {
    var panel = this.po.getResourcePanel(resource);
    expect(panel.isPresent()).toBe(isOpen);
  };

  this.ifDisplayingProperties = function (resource, propertiesName, propertiesType) {
    var bodyProperties = this.po.getTryItBodyPanelParameters(resource);

    propertiesName.forEach(function (name, index) {
      var property = bodyProperties.get(index);
      expect(property.getText()).toContain(name);

      var type = propertiesType[index];
      expect(property.getText()).toContain(type);
    });
  };

  this.ifDisplayingPropertyExample = function (resource, property, name) {
    var bodyProperty = this.po.getTryItBodyPanelParameter(resource, property);
    expect(bodyProperty.getAttribute('value')).toBe(name);
  };

  this.ifDisplayingDocumentationBodyProperties = function (resource, propertiesName, propertiesType) {
    var bodyProperties = this.po.getDocumentationBodyPanelParameters(resource);

    propertiesName.forEach(function (name, index) {
      var property = bodyProperties.get(index + 1);
      expect(property.getText()).toContain(name);

      var type = propertiesType[index];
      expect(property.getText()).toContain(type);
    });
  };

  this.ifDisplayingDescription = function (resource, expectedDescription) {
    var resourceDescription = this.po.getDescription(resource);

    expect(resourceDescription.getText()).toContain(expectedDescription);
  };

  this.ifDisplayingDescriptionUrl = function (resource, expectedDescription) {
    var url = this.po.getDescriptionUrl(resource);

    expect(url).toContain(expectedDescription);
  };

  this.ifDisplayingRootDescription = function (expectedDescription) {
    var rootDescription = this.po.getRootDescription();

    expect(rootDescription.getText()).toContain(expectedDescription);
  };
}

module.exports = Resource;
