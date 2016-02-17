(function () {
  'use strict';

  RAML.Directives.resourceType = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/resource-type.tpl.html',
      scope: {
        resource: '='
      },
      controller: ['$scope', function ($scope) {
        $scope.resourceType = RAML.Transformer.transformResourceType($scope.resource.type());
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('resourceType', RAML.Directives.resourceType);
})();
