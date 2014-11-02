'use strict';

function ResourcesPO () {
  this.title = element(by.css('.title'));

  this.getTitle = function () {
    return this.title.getText();
  };
}

module.exports = ResourcesPO;
