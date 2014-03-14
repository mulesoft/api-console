'use strict';

(function() {
  var controller = function($scope, DataStore) {
    this.DataStore = DataStore;
    this.key = $scope.keyBase + ':toggle';
    this.toggleItems = $scope.toggleItems = [];
    this.toggleModel = $scope.toggleModel || {};

    $scope.toggle = this;
  };

  controller.prototype.select = function(toggleItem, dontPersist) {
    this.toggleModel.selected = undefined;
    this.toggleItems.forEach(function(toggleItem) {
      toggleItem.active = false;
    });

    toggleItem.active = true;
    this.toggleModel.selected = toggleItem.heading;

    if (!dontPersist) {
      this.DataStore.set(this.key, toggleItem.heading);
    }
  };

  controller.prototype.addToggleItem = function(toggleItem) {
    var previouslyEnabled = this.DataStore.get(this.key) === toggleItem.heading,
        noneActive = this.toggleItems.every(function(toggleItem) { return !toggleItem.active; });

    if (noneActive || previouslyEnabled) {
      this.select(toggleItem, true);
    }

    this.toggleItems.push(toggleItem);
  };

  RAML.Controllers.toggle = controller;
})();
