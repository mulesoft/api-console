'use strict';

(function() {

  var controller = function($scope) {
    this.tabs = $scope.tabs = [];
    $scope.tabset = this;
  };

  controller.prototype.select = function(tab) {
    if (tab.disabled) {
      return;
    }
    this.tabs.forEach(function(tab) {
      tab.active = false;
    });
    tab.active = true;
  };

  controller.prototype.addTab = function(tab) {
    if (this.tabs.every(function(tab) { return tab.disabled; }) || tab.active) {
      this.select(tab);
    }
    this.tabs.push(tab);
  };

  RAML.Controllers.tabset = controller;

})();
