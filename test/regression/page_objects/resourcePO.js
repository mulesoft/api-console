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

  this.getTryItGetBtn = function (index) {
    return this.resources.get(index+1).element(by.css('.raml-console-sidebar-action-get'));
  };

  this.getTryItErrorMessages = function (index) {
    return this.resources.get(index+1).all(by.css('.raml-console-sidebar-row > .raml-console-resource-param-instructional'));
  };

  this.getSecuritySchemes = function (index) {
    return this.resources.get(index+1).all(by.tagName('option'));
  };

  this.getSecuritySchemeHeaderTitles = function (index) {
    return this.resources.get(index+1).all(by.css('.raml-console-resource-param-heading'));
  };

  this.getUsernameField = function () {
    return element(by.name('username'));
  };

  this.getPasswordField = function () {
    return element(by.name('password'));
  };

  this.getCloseBtn = function (index) {
    return this.resources.get(index+1).all(by.css('.raml-console-resource-close-btn'));
  };

  this.getQueryParameterDetails = function (index) {
    return this.resources.get(index+1).all(by.css('.raml-console-resource-param-heading'));
  };

  this.getTryItQueryParameterInput = function (resourceIndex, inputIndex) {
    return this.resources.get(resourceIndex+1).all(by.css('.raml-console-sidebar-content-wrapper .raml-console-sidebar-input')).get(inputIndex);
  };

  this.toggleResourceMethod = function (resource, method) {
    var button = this.getMethodBtn(resource, method);
    button.click();
  };

  this.getReponseExamples = function (resource) {
    return this.resources.get(resource+1).element(by.css('.raml-console-hljs pre code'));
  };
}

ResourcesPO.prototype = basePO;

module.exports = ResourcesPO;
