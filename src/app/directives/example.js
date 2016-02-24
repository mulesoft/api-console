(function () {
  'use strict';

  RAML.Directives.example = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/example.tpl.html',
      scope: {
        example: '=',
        mediaType: '='
      },
      controller: ['$scope', function($scope) {
        $scope.getBeautifiedExample = function (value) {
          var result = value;

          try {
            result = beautify(value, $scope.mediaType);
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
    .directive('example', RAML.Directives.example);
})();
