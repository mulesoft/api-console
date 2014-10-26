(function () {
  'use strict';

  RAML.Directives.resourceType = function() {
    return {
      restrict: 'E',
      templateUrl: 'resources/resource-type.tpl.html',
      replace: true,
      controller: function ($scope) {
        var resourceType = $scope.resource.resourceType;

        if (typeof resourceType === 'object') {
          $scope.resource.resourceType = Object.keys(resourceType).join();
        }
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('resourceType', RAML.Directives.resourceType);
})();
