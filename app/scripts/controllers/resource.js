(function() {
  'use strict';

  var controller = function($scope, DataStore, $element) {
    $scope.resourceView = this;
    this.resource = $scope.resource;
    this.DataStore = DataStore;
    this.expanded = this.DataStore.get(this.resourceKey());

    this.initiateExpand = function(method) {
      if ($scope.method) {
        $scope.method = method;
      } else {
        $scope.methodToAdd = method;
      }
    };

    this.expandMethod = function(method) {
      $scope.method = method;
      $scope.methodToAdd = method;
      DataStore.set(this.methodKey(), method.method);
    };

    this.collapseMethod = function($event) {
      DataStore.set(this.methodKey(), undefined);
      $scope.methodToAdd = undefined;
      $event.stopPropagation();
    };

    this.toggleExpansion = function() {
      if ($scope.methodToAdd || $scope.method) {
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
        this.expanded = false;
        this.expandMethod(method);
        $element.children().css('height', DataStore.get('pop-up:wrapper-height'));
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
