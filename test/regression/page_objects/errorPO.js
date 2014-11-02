'use strict';

function ErrorPO () {
  this.title        = element(by.css('.heading'));
  this.errorMessage = element(by.css('.error-message'));
  this.errorSnippet = element(by.css('.error-snippet'));

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

module.exports = ErrorPO;
