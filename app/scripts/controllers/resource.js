(function() {
  'use strict';

  var controller = function($scope, DataStore) {
    $scope.resourceView = this;
    this.resource = $scope.resource;
    this.DataStore = DataStore;
    this.expanded = this.DataStore.get(this.resourceKey());

    this.expandMethod = function(method) {
      $scope.method = method;
      this.expanded = true;
    };

    this.toggleExpansion = function() {
      if ($scope.method) {
        return;
      }

      this.expanded = !this.expanded;
      this.DataStore.set(this.resourceKey(), this.expanded);
    };
  };

  controller.prototype.resourceKey = function() {
    return this.resource.toString();
  };

  RAML.Controllers.Resource = controller;

})();
