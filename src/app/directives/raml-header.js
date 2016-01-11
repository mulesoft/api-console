(function () {
  'use strict';

  RAML.Directives.ramlHeader = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/raml-header.tpl.html',
      scope: {
        header: '='
      },
      controller: ['$scope', function($scope) {
        $scope.description = RAML.Transformer.transformValue($scope.header.description());
        $scope.displayName = $scope.header.name();
        $scope.type = $scope.header.type();
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('ramlHeader', RAML.Directives.ramlHeader);
})();
