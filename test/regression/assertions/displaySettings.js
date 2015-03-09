'use strict';

var factory = require('../page_objects');

function DisplaySettings (poName) {
  this.po = factory.create(poName);

  this.ifThemeSwitcherIsDisabled = function () {
    expect(this.po.count()).toBe(1);
    this.po.getButtonAt(0).then(function (value) {
      expect(value.trim()).toBe('Download API Client');
    });
  };

  this.ifDownloadApiClientIsDisabled = function () {
    expect(this.po.count()).toBe(1);
    this.po.getButtonAt(0).then(function (value) {
      expect(value.trim()).toBe('Switch Theme');
    });
  };

  this.ifMetaButtonGroupIsDisabled = function () {
    expect(this.po.count()).toBe(0);
  };

  this.ifTitleIsDisabled = function () {
    expect(this.po.title.isPresent()).toBe(false);
  };

  this.ifDisplayingInSingleViewMode = function () {
    var button = this.po.getMethodButton();

    button.click();

    expect(this.po.getCollepsedForm().isPresent()).toBe(true);
  };

  this.ifResourcesAreCollapsed = function () {
    expect(this.po.resourceToggler.getAttribute('class')).toContain('raml-console-is-active');
  };
}

module.exports = DisplaySettings;
