(function () {
  'use strict';

  RAML.Directives.rootTypes = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/root-types.tpl.html',
      replace: true,
      scope: {
        types: '='
      },
      controller: ['$scope', function ($scope) {
        $scope.convertTypes = function () {
          var types = {};
          $scope.types.forEach(function (type) {
            types[Object.keys(type)[0]] = type[Object.keys(type)[0]];
          });
          $scope.theTypes = RAML.Inspector.Properties.normalizeNamedParameters(types);
        };

        $scope.$watch('types', function () {
          $scope.convertTypes();
        });
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('rootTypes', RAML.Directives.rootTypes);
})();
