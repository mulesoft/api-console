(function() {
  'use strict';

  function stringForDisplay(objectOrString) {
    if (angular.isObject(objectOrString)) {
      return Object.keys(objectOrString)[0];
    } else if (objectOrString) {
      return objectOrString;
    } else {
      return undefined;
    }
  }

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
    return stringForDisplay(this.resource.resourceType);
  };

  controller.prototype.traits = function() {
    return (this.resource.traits || []).map(stringForDisplay);
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
