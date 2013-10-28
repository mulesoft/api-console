(function() {
  'use strict';

  function stringForDisplay(objectOrString) {
    if (angular.isObject(objectOrString)) {
      return Object.keys(objectOrString)[0];
    } else {
      return objectOrString;
    }
  }

  var controller = function($scope) {
    $scope.resourceSummary = this;
    this.resource = $scope.resource;
  };

  controller.prototype.type = function() {
    return stringForDisplay(this.resource.resourceType);
  };

  controller.prototype.traits = function() {
    return (this.resource.traits || []).map(stringForDisplay);
  };

  RAML.Directives.resourceSummary = function() {
    return {
      restrict: 'E',
      templateUrl: 'views/resource_summary.tmpl.html',
      replace: true,
      controller: controller
    };
  };
})();
