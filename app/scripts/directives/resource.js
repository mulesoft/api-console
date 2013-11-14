(function() {
  'use strict';

  var controller = function($scope) {
    $scope.resourceView = this;
    this.resource = $scope.resource;
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
  };

  controller.prototype.type = function() {
    return this.resource.resourceType;
  };

  controller.prototype.traits = function() {
    return this.resource.traits || [];
  };

  RAML.Directives.resource = function() {
    return {
      restrict: 'E',
      templateUrl: 'views/resource.tmpl.html',
      replace: true,
      controller: controller
    };
  };
})();
