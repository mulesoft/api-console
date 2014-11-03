'use strict';

var factory = require('../page_objects');

function Error (poName) {
  this.po = factory.create(poName);

  this.ifTitleIsPresent = function (title) {
    expect(this.po.title.isPresent()).toBe(true);
    expect(this.po.getTitle()).toBe(title);
  };

  this.ifErrorMessageIsPresent = function (errorMessage) {
    expect(this.po.errorMessage.isPresent()).toBe(true);
    expect(this.po.getErrorMessage()).toBe(errorMessage);
  };

  this.ifSnippetIsPresent = function (snippet) {
    expect(this.po.errorSnippet.isPresent()).toBe(true);
    expect(this.po.getErrorSnippet()).toBe(snippet);
  };

  this.ifRamlIsPresent = function () {
    var that = this;
    this.po.getRaml().then(function (value) {
      var expected = that.po.examples.minimum.join('').replace(/ /g, '');
      value = value.split('\n').join('').replace(/ /g, '');
      expect(value).toBe(expected);
    });
  };
}

module.exports = Error;
