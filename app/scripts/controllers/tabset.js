'use strict';

(function() {
  function Controller($scope, DataStore) {
    this.tabs = [];
    this.DataStore = DataStore;
    this.key = $scope.keyBase + ':tabset';

    $scope.tabset = this;
  }

  Controller.prototype.select = function(tab, dontPersist) {
    if (tab.disabled) {
      return;
    }

    if (!dontPersist) {
      this.DataStore.set(this.key, tab.heading);
    }

    this.tabs.forEach(function(item) {
      item.active = false;
    });

    tab.active = true;
    this.active = tab;
  };

  Controller.prototype.addTab = function(tab) {
    var previouslyEnabled = this.DataStore.get(this.key) === tab.heading,
        allOthersDisabled = this.tabs.every(function(tab) { return tab.disabled; });

    if (allOthersDisabled || previouslyEnabled) {
      this.select(tab, this.DataStore.get(this.key));
    }

    this.tabs.push(tab);
  };


  RAML.Controllers.tabset = Controller;
})();
