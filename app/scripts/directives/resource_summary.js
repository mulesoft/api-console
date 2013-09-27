(function() {
  'use strict';

  var controller = function($scope) {
    $scope.resourceSummary = this;
    this.resource = $scope.resource;
  };

  controller.prototype.type = function() {
    if (angular.isObject(this.resource.resourceType)) {
      return Object.keys(this.resource.resourceType)[0];
    } else {
      return this.resource.resourceType;
    }
  };

  RAML.Directives.resourceSummary = function() {
    return {
      restrict: 'E',
      templateUrl: 'views/resource_summary.tmpl.html',
      replace: true,
      controller: controller
    }
  }
})();
