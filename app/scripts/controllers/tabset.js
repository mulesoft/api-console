'use strict';

(function() {
  var controller = function($scope, DataStore) {
    this.tabs = $scope.tabs = [];
    $scope.tabset = this;
    this.DataStore = DataStore;
    this.key = $scope.keyBase + ':tabset';
  };

  controller.prototype.select = function(tab, dontPersist) {
    if (tab.disabled) {
      return;
    }

    this.tabs.forEach(function(tab) {
      tab.active = false;
    });

    tab.active = true;
    if (!dontPersist) {
      this.DataStore.set(this.key, tab.heading);
    }
  };

  controller.prototype.addTab = function(tab) {
    var previouslyEnabled = this.DataStore.get(this.key, true) === tab.heading,
        allOthersDisabled = this.tabs.every(function(tab) { return tab.disabled; });

    if (allOthersDisabled || previouslyEnabled) {
      this.select(tab, true);
    }

    this.tabs.push(tab);
  };


  RAML.Controllers.tabset = controller;

})();
