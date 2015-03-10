'use strict';

var basePO = require('./basePO');

function InitializerPO () {
  this.container       = element(by.css('.raml-console-meta-button-group'));
  this.title           = element(by.css('.raml-console-title'));
  this.resourceToggler = element(by.css('.raml-console-resource-root-toggle'));

  this.count = function () {
    return this.container.all(by.css('.raml-console-meta-button')).count();
  };

  this.getButtonAt = function (index) {
    return this.container.all(by.css('.raml-console-meta-button')).get(index).getInnerHtml();
  };

  this.getCollepsedForm = function () {
    return element(by.css('.raml-console-is-collapsed'));
  };

  this.getMethodButton = function () {
    return element.all(by.css('.raml-console-resource-list-item'))
            .get(1)
            .all(by.css('.raml-console-tab'))
            .get(0)
            .element(by.css('.raml-console-tab-label'));
  };
}

InitializerPO.prototype = basePO;

module.exports = InitializerPO;
