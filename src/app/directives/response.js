(function () {
  'use strict';

  RAML.Directives.response = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/response.tpl.html',
      scope: {
        code: '=',
        currentBodySelected: '=',
        getBeautifiedExampleRef: '&getBeautifiedExample',
        response: '=',
        responseInfo: '=',
        showSchemaRef: '&showSchema'
      },
      controller: ['$scope', function($scope) {
        $scope.description = RAML.Transformer.transformValue($scope.response.description());
        $scope.headers = RAML.Transformer.nullIfEmpty($scope.response.headers());
        $scope.body = RAML.Transformer.transformBody($scope.response.body());

        $scope.showSchema = $scope.showSchemaRef();

        $scope.getBeautifiedExample = $scope.getBeautifiedExampleRef();
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('response', RAML.Directives.response);
})();
