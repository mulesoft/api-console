'use strict';

var basePO = require('./basePO');

function ResourcesPO () {
  this.title           = element(by.css('.title'));
  this.resources       = element.all(by.css('.resource-list-item'));

  this.getTitle = function () {
    return this.title.getText();
  };

  this.getResourceElementAt = function (index) {
    return this.resources.get(index).element(by.css('.resource-heading-large'));
  };

  this.getNestedResourceElementAt = function (index) {
    return this.resources.get(index).element(by.css('.resource-heading'));
  };

  this.getResourceTitleAt = function (index) {
    return this.getResourceElementAt(index).getText();
  };

  this.getNestedResourceTitleAt = function (index) {
    return this.getNestedResourceElementAt(index).getText();
  };

  this.getMethodsForResourceAt = function (index) {
    return this.resources.get(index).all(by.css('.tab'));
  };

  this.getMethodTitleAt = function (resource, method) {
    return this.getMethodsForResourceAt(resource).get(method).element(by.css('.tab-label')).getText();
  };

  this.getMethodBtn = function (resource, method) {
    return this.getMethodsForResourceAt(resource).get(method).element(by.css('.tab-label'));
  };

  this.getSecuritySchemes = function (resource) {
    return this.resources.get(resource).all(by.css('.sidebar-toggle-group .toggle'));
  };
}

ResourcesPO.prototype = basePO;

module.exports = ResourcesPO;
