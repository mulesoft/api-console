(function () {
  'use strict';

  RAML.Directives.response = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/response.tpl.html',
      scope: {
        code: '=',
        currentBodySelected: '=',
        response: '=',
        responseInfo: '=',
        showSchemaRef: '&showSchema'
      },
      controller: ['$scope', function($scope) {
        $scope.description = RAML.Transformer.transformValue($scope.response.description());
        $scope.headers = RAML.Transformer.nullIfEmpty($scope.response.headers());
        $scope.body = RAML.Transformer.transformBody($scope.response.body());

        $scope.showSchema = $scope.showSchemaRef();

        $scope.getBeatifiedExample = function (value) {
          var result = value;

          try {
            result = beautify(value, $scope.currentBodySelected);
          }
          catch (e) { }

          return result;
        };

        function beautify(body, contentType) {
          if(contentType.indexOf('json')) {
            body = vkbeautify.json(body, 2);
          }

          if(contentType.indexOf('xml')) {
            body = vkbeautify.xml(body, 2);
          }

          return body;
        }
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('response', RAML.Directives.response);
})();
