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

    expect(securitySchemesCount).toBe(2);

    securitySchemesCount.then(function (count) {
      for (var i = 0; i < count; i++) {
        expect(schemes.get(i).getInnerHtml()).toBe(expectedSchemes[i]);
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
}


module.exports = Resource;
