(function() {
  'use strict';

  var controller = function($scope, DataStore) {
    $scope.resourceView = this;
    this.resource = $scope.resource;
    this.DataStore = DataStore;
    this.expanded = this.DataStore.get(this.resourceKey());

    this.expandMethod = function(method) {
      $scope.method = method;
      DataStore.set(this.methodKey(), method.method);
      this.expanded = true;
    };

    this.toggleExpansion = function() {
      if ($scope.method) {
        return;
      }

      this.expanded = !this.expanded;
      this.DataStore.set(this.resourceKey(), this.expanded);
    };

    var methodName = this.DataStore.get(this.methodKey());
    if (methodName) {
      var method = this.resource.methods.filter(function(method) {
        return method.method === methodName;
      })[0];
      if (method) {
        this.expandMethod(method);
      }
    }
  };

  controller.prototype.resourceKey = function() {
    return this.resource.toString();
  };

  controller.prototype.methodKey = function() {
    return this.resourceKey() + ':method';
  };

  RAML.Controllers.Resource = controller;

})();
