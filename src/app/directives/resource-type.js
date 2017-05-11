(function () {
  'use strict';

  RAML.Directives.resourceType = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/resource-type.tpl.html',
      replace: true,
      controller: ['$scope', function ($scope) {
        var resourceType = $scope.resource.resourceType;

        if (resourceType !== null && typeof resourceType === 'object') {
          $scope.resource.resourceType = Object.keys(resourceType).join();
        }
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('resourceType', RAML.Directives.resourceType);
})();
