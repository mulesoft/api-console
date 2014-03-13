(function() {
  'use strict';

  var controller = function($scope, DataStore, $element) {
    this.resourceKey = function() {
      return $scope.resource.toString();
    };

    this.initiateExpand = function(method) {
      if ($scope.selectedMethod) {
        $scope.selectedMethod = method;
        DataStore.set(this.methodKey(), method.method);
      } else {
        DataStore.set($scope.api.title + ':popup', $scope.resource.toString());
        $scope.methodToAdd = method;
      }
    };

    this.expandMethod = function(method) {
      $scope.selectedMethod = method;
      $scope.methodToAdd = method;
      DataStore.set(this.methodKey(), method.method);
    };

    this.collapseMethod = function($event) {
      DataStore.set(this.methodKey(), undefined);
      DataStore.set($scope.api.title + ':popup', undefined);
      $scope.methodToAdd = undefined;
      if ($event) {
        $event.stopPropagation();
      }
    };

    this.toggleExpansion = function() {
      if ($scope.methodToAdd || $scope.selectedMethod) {
        return;
      }

      this.expanded = !this.expanded;
      this.DataStore.set(this.resourceKey(), this.expanded);
    };

    $scope.resourceView = this;
    this.DataStore = DataStore;

    this.expanded = this.DataStore.get(this.resourceKey());
    var methodName = this.DataStore.get(this.methodKey());

    if (methodName) {
      var method = $scope.resource.methods.filter(function(method) {
        return method.method === methodName;
      })[0] || $scope.resource.methods[0];

      if (method) {
        this.expanded = false;
        this.expandMethod(method);
        $element.children().css('height', DataStore.get('pop-up:wrapper-height'));
      } else {
        this.collapseMethod();
      }
    }
  };

  controller.prototype.methodKey = function() {
    return this.resourceKey() + ':method';
  };

  RAML.Controllers.Resource = controller;

})();
