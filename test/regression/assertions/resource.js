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
}


module.exports = Resource;
