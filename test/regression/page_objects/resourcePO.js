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

  this.getTypesBtn = function () {
    return element(by.id('raml-console-documentation-container')).element(by.css('.raml-console-resource-root-toggle'));
  };

  this.getCloseMethodBtn = function (resource) {
    return this.resources.get(resource+1).element(by.css('.raml-console-resource-close-btn'));
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

  this.getQueryParametersDetail = function (index) {
    return this.resources.get(index+1).all(by.css('.raml-console-resource-param-heading'));
  };

  this.getQueryParametersDescription = function (index) {
    return this.resources.get(index+1).element(by.id('docs-query-parameters')).all(by.css('.raml-console-marked-content'));
  };

  this.getTryItQueryParameterInput = function (resourceIndex, inputIndex) {
    return this.resources.get(resourceIndex+1).all(by.css('.raml-console-sidebar-content-wrapper .raml-console-sidebar-input')).get(inputIndex);
  };

  this.getTypeProperties = function () {
    return element.all(by.css('.raml-console-resource-param'));
  };

  this.toggleRootType = function(type) {
    var button = element.all(by.css('.raml-console-resource-param-heading span')).get(type);
    button.click();
  };

  this.toggleResourceMethod = function (resource, method) {
    var button = this.getMethodBtn(resource, method);
    button.click();
  };

  this.toggleRootTypes = function () {
    var button = this.getTypesBtn();
    button.click();
  };

  this.toggleCloseMethod = function(resource, method) {
    var button = this.getCloseMethodBtn(resource, method);
    button.click();
  };

  this.getResponseExamples = function (resource) {
    return this.resources.get(resource+1).element(by.css('.raml-console-hljs pre code'));
  };

  this.getResponseSchemaExamples = function (resource) {
    var button = this.resources.get(resource+1).element(by.css('.raml-console-schema-body h4 .raml-console-flag'));
    button.click();

    return this.getResponseExamples(resource);
  };

  this.getRequestUrl = function (resource) {
    var requestSection = this.resources.get(resource + 1).element(by.css('.raml-console-sidebar-expand-btn'));
    requestSection.click();

    return this.resources.get(resource + 1)
      .element(by.css('.raml-console-sidebar-request-url'));
  };

  this.getResourcePanel = function(resource) {
    return this.resources.get(resource + 1).element(by.css('.raml-console-resource-panel'));
  };

  this.getTryItBodyPanelParameters = function (resource) {
    return this.resources.get(resource + 1)
      .element(by.id('sidebar-body'))
      .element(by.css('.raml-console-sidebar-row.raml-console-body-data'))
      .all(by.tagName('p'));
  };

  this.getTryItBodyPanelParameter = function (resource, id) {
    return this.resources.get(resource + 1)
      .element(by.id('sidebar-body'))
      .element(by.css('.raml-console-sidebar-row.raml-console-body-data'))
      .element(by.id(id));
  };

  this.getDocumentationBodyPanelParameters = function (resource) {
    return this.resources.get(resource + 1)
      .element(by.css('.raml-console-documentation-body'))
      .all(by.css('.raml-console-resource-param'));
  };

  this.getDescription = function (resource) {
    return this.resources.get(resource + 1)
      .element(by.css('.raml-console-resource-level-description'));
  };

  this.getRootDescription = function () {
    return element(by.css('.raml-console-root-description'));
  };
}

ResourcesPO.prototype = basePO;

module.exports = ResourcesPO;
