'use strict';

(function() {
  var controller = function($scope, DataStore) {
    this.DataStore = DataStore;
    this.key = $scope.keyBase + ':toggle';
    this.toggleItems = $scope.toggleItems = [];

    $scope.toggle = this;
  };

  controller.prototype.select = function(toggleItem, dontPersist) {
    if (toggleItem.disabled) {
      return;
    }

    this.toggleItems.forEach(function(toggleItem) {
      toggleItem.active = false;
    });

    toggleItem.active = true;
    if (!dontPersist) {
      this.DataStore.set(this.key, toggleItem.heading);
    }
  };

  controller.prototype.addToggleItem = function(toggleItem) {
    var previouslyEnabled = this.DataStore.get(this.key) === toggleItem.heading,
        allOthersDisabled = this.toggleItems.every(function(toggleItem) { return toggleItem.disabled; });

    if (allOthersDisabled || previouslyEnabled) {
      this.select(toggleItem, true);
    }

    this.toggleItems.push(toggleItem);
  };


  RAML.Controllers.toggle = controller;
})();
