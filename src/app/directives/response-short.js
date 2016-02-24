(function () {
  'use strict';

  RAML.Directives.responseShort = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/response-short.tpl.html',
      scope: {
        code: '=',
        info: '='
      },
      controller: ['$scope', function($scope) {
        $scope.description = RAML.Transformer.transformValue($scope.info.description());
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('responseShort', RAML.Directives.responseShort);
})();
