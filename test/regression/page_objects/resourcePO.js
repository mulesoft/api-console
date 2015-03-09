'use strict';

var basePO = require('./basePO');

function ResourcesPO () {
  this.title           = element(by.css('.raml-console-title'));
  this.resources       = element.all(by.css('.raml-console-resource-list-item'));

  this.getTitle = function () {
    return this.title.getText();
  };

  this.getResourceElementAt = function (index) {
    return this.resources.get(index+1).element(by.tagName('h2'));
  };

  this.getNestedResourceElementAt = function (index) {
    return this.resources.get(index+1).element(by.css('.raml-console-resource-heading'));
  };

  this.getResourceTitleAt = function (index) {
    return this.getResourceElementAt(index).getText();
  };

  this.getNestedResourceTitleAt = function (index) {
    return this.getNestedResourceElementAt(index).getText();
  };

  this.getMethodsForResourceAt = function (index) {
    return this.resources.get(index+1).all(by.css('.raml-console-tab'));
  };

  this.getMethodTitleAt = function (resource, method) {
    return this.getMethodsForResourceAt(resource).get(method).element(by.css('.raml-console-tab-label')).getInnerHtml();
  };

  this.getMethodBtn = function (resource, method) {
    return this.getMethodsForResourceAt(resource).get(method).element(by.css('.raml-console-tab-label'));
  };

  this.getSecuritySchemes = function (index) {
    return this.resources.get(index+1).all(by.tagName('option'));
  };
}

ResourcesPO.prototype = basePO;

module.exports = ResourcesPO;
