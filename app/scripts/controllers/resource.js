(function() {
  'use strict';

  var controller = function($scope, DataStore, $element) {
    $scope.resourceView = this;
    this.DataStore = DataStore;

    this.resourceKey = function() {
      return $scope.resource.toString();
    };

    this.expanded = this.DataStore.get(this.resourceKey());

    this.prepareForAnimation = function($event) {
      $event.stopPropagation();

      if (!this.expanded) {
        this.toggleExpansion();
      }
      $scope.$emit('console:expand', $scope.resource, $element);
    }

    this.expandMethod = function(method) {
      $scope.selectedMethod = method;
      $scope.methodToAdd = method;
      DataStore.set(this.methodKey(), method.method);
    };

    this.collapseMethod = function($event) {
      DataStore.set(this.methodKey(), undefined);
      $scope.methodToAdd = undefined;
      $event.stopPropagation();
    };

    this.toggleExpansion = function() {
      if ($scope.methodToAdd || $scope.selectedMethod) {
        return;
      }
      this.expanded = !this.expanded;
      this.DataStore.set(this.resourceKey(), this.expanded);
    };

    var methodName = this.DataStore.get(this.methodKey());
    if (methodName) {
      var method = $scope.resource.methods.filter(function(method) {
        return method.method === methodName;
      })[0];
      if (method) {
        this.expanded = false;
        this.expandMethod(method);
        $scope.$emit('console:blockScroll');
        $element.children().css('height', DataStore.get('pop-up:wrapper-height'));
      } else {
        $scope.$emit('console:restoreScroll');
      }
    }
  };

  controller.prototype.methodKey = function() {
    return this.resourceKey() + ':method';
  };

  RAML.Controllers.Resource = controller;

})();
