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

  this.ifShowingSecuritySchemes = function (resource, method, expectedSchemes) {
    var button = this.po.getMethodBtn(resource, method);
    var schemes, securitySchemesCount;

    button.click();

    schemes              = this.po.getSecuritySchemes(resource);
    securitySchemesCount = schemes.count();

    expect(securitySchemesCount).toBe(expectedSchemes.length);

    securitySchemesCount.then(function (count) {
      for (var i = 0; i < count; i++) {
        expect(schemes.get(i).getInnerHtml()).toBe(expectedSchemes[i]);
      }
    });
  };

  this.ifShowingGrants = function (resource, method, expectedGrants) {
    var grants     = this.po.getGrants(resource);
    var grantCount = grants.count();

    expect(grantCount).toBe(expectedGrants.length);

    grantCount.then(function (count) {
      for (var i = 0; i < count; i++) {
        expect(grants.get(i).getInnerHtml()).toBe(expectedGrants[i]);
      }
    });
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

  this.ifShowingFormParameters = function (resource, method, sectionIndex, expectedFormParameters) {
    var resourcesGetButton  = this.po.getMethodBtn(0, 0);
    resourcesGetButton.click();

    // TODO: Remove this button click when merging bugfix/form-parameters
    var bodyMediaTypeButton = this.po.getBodyMediaTypeBtn(0, 0);
    bodyMediaTypeButton.click();

    var formParameters      = this.po.getResourceParameters(resource, sectionIndex);
    var formParametersCount = formParameters.count();

    expect(formParametersCount).toBe(expectedFormParameters.length);

    formParametersCount.then(function (count) {
      for (var i = 0; i < count; i++) {
        expect(formParameters.get(i).getInnerHtml()).toMatch(expectedFormParameters[i]);
      }
    });
  };

  this.ifShowingQueryParameters = function (resource, method, sectionIndex, expectedQueryParameters) {
    var resourcesGetButton  = this.po.getMethodBtn(0, 0);
    resourcesGetButton.click();

    var queryParameters      = this.po.getResourceParameters(resource, sectionIndex);
    var queryParametersCount = queryParameters.count();

    expect(queryParametersCount).toBe(expectedQueryParameters.length);

    queryParametersCount.then(function (count) {
      for (var i = 0; i < count; i++) {
        expect(queryParameters.get(i).getInnerHtml()).toMatch(expectedQueryParameters[i]);
      }
    });
  };

  this.ifShowingHeaders = function (resource, method, sectionIndex, expectedHeaders) {
    var resourcesGetButton  = this.po.getMethodBtn(0, 0);
    resourcesGetButton.click();

    var headers      = this.po.getResourceParameters(resource, sectionIndex);
    var headersCount = headers.count();

    expect(headersCount).toBe(expectedHeaders.length);

    headersCount.then(function (count) {
      for (var i = 0; i < count; i++) {
        expect(headers.get(i).getInnerHtml()).toMatch(expectedHeaders[i]);
      }
    });
  };

  this.ifShowingBaseUriParameters = function (resource, method, sectionIndex, expectedBaseUriParameters) {
    var resourcesGetButton  = this.po.getMethodBtn(0, 0);
    resourcesGetButton.click();

    var baseUriParameters      = this.po.getResourceParameters(resource, sectionIndex);
    var baseUriParametersCount = baseUriParameters.count();

    expect(baseUriParametersCount).toBe(expectedBaseUriParameters.length);

    baseUriParametersCount.then(function (count) {
      for (var i = 0; i < count; i++) {
        expect(baseUriParameters.get(i).getInnerHtml()).toMatch(expectedBaseUriParameters[i]);
      }
    });
  };

  this.ifShowingUriParameters = function (resource, method, sectionIndex, expectedUriParameters) {
    var resourcesGetButton  = this.po.getMethodBtn(0, 0);
    resourcesGetButton.click();

    var uriParameters      = this.po.getResourceParameters(resource, sectionIndex);
    var uriParametersCount = uriParameters.count();

    expect(uriParametersCount).toBe(expectedUriParameters.length);

    uriParametersCount.then(function (count) {
      for (var i = 0; i < count; i++) {
        expect(uriParameters.get(i).getInnerHtml()).toMatch(expectedUriParameters[i]);
      }
    });
  };
}


module.exports = Resource;
