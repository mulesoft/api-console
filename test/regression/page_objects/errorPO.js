'use strict';

var basePO = require('./basePO');

function ErrorPO () {
  this.title        = element(by.css('.raml-console-heading'));
  this.errorMessage = element(by.css('.raml-console-error-message'));
  this.errorSnippet = element(by.css('.raml-console-error-snippet'));

  this.getTitle = function () {
    return this.title.getText();
  };

  this.getErrorMessage = function () {
    return this.errorMessage.getText();
  };

  this.getErrorSnippet = function () {
    return this.errorSnippet.getText();
  };

  this.getRaml = function () {
    return browser.executeScript('return jQuery(".CodeMirror")[0].CodeMirror.getValue();');
  };
}

ErrorPO.prototype = basePO;

module.exports = ErrorPO;
