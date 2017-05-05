(function () {
  'use strict';

  RAML.Directives.typeProperties = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/type-properties.tpl.html',
      replace: true,
      scope: {
        type: '=',
        showExamples: '='
      },
      controller: ['$scope', function ($scope) {
        $scope.$watch('type', function () {
          $scope.properties = {};
          $scope.properties[$scope.type.name] = [$scope.type];
        });
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('typeProperties', RAML.Directives.typeProperties);
})();
