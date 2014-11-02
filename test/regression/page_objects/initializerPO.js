'use strict';

var basePO = require('./basePO');

function InitializerPO () {
  this.ramlPathInput      = element(by.id('ramlPath'));
  this.loadRamlFromUrlBtn = element(by.id('loadRamlFromUrl'));
  this.ramlEditor         = element(by.id('raml'));
  this.loadRamlBtn        = element(by.id('loadRaml'));

  this.setRamlPath = function(path) {
    this.ramlPathInput.sendKeys(path);
  };

  this.setRaml = function(raml) {
    for (var i = 0; i < raml.length; i++) {
      browser.executeScript('jQuery(".CodeMirror")[0].CodeMirror.setLine(' + i + ', "' + raml[i] + ' \\n")');
    }
  };

  this.loadRamlFromUrl = function() {
    this.loadRamlFromUrlBtn.click();
  };

  this.loadRaml = function() {
    this.loadRamlBtn.click();
  };
}

InitializerPO.prototype = basePO;

module.exports = InitializerPO;
