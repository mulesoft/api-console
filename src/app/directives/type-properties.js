(function () {
  'use strict';

  RAML.Directives.typeProperties = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/type-properties.tpl.html',
      replace: true,
      scope: {
        type: '='
      },
      controller: ['$scope', function ($scope) {
        $scope.properties = {
          body: [$scope.type]
        };
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('typeProperties', RAML.Directives.typeProperties);
})();
