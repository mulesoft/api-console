'use strict';

var basePO = require('./basePO');

function ResourcesPO () {
  this.title = element(by.css('.title'));

  this.getTitle = function () {
    return this.title.getText();
  };
}

ResourcesPO.prototype = basePO;

module.exports = ResourcesPO;
