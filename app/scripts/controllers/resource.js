(function() {
  'use strict';

  var controller = function($scope, DataStore) {
    $scope.resourceView = this;
    this.resource = $scope.resource;
    this.DataStore = DataStore;
    this.expanded = this.DataStore.get(this.resourceKey());
  };

  controller.prototype.resourceKey = function() {
    return this.resource.toString();
  };

  controller.prototype.expandInitially = function(method) {
    if (method.method === this.methodToExpand) {
      delete this.methodToExpand;
      return true;
    }
    return false;
  };

  controller.prototype.expandMethod = function(method) {
    this.methodToExpand = method.method;
  };

  controller.prototype.toggleExpansion = function() {
    this.expanded = !this.expanded;
    this.DataStore.set(this.resourceKey(), this.expanded);
  };

  RAML.Controllers.Resource = controller;

})();
