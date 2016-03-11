(function () {
  'use strict';

  RAML.Directives.examples = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/examples.tpl.html',
      scope: {
        exampleContainer: '=',
        getBeatifiedExampleRef: '&'
      },
      controller: ['$scope', function($scope) {
        $scope.getBeatifiedExample = $scope.getBeatifiedExampleRef();
        $scope.examples = transformExample($scope.exampleContainer);
        $scope.currentExample = 0;

        $scope.changeExample = function(example) {
          $scope.currentExample = example;
        };

        $scope.$watch('exampleContainer', function (value) {
          $scope.examples = transformExample(value);
        });
      }]
    };
  };

  function transformExample(exampleContainer) {
    if (exampleContainer.example) {
      return [{
        name: 'Example',
        content: exampleContainer.example
      }];
    } else if (exampleContainer.examples) {
      if (Array.isArray(exampleContainer.examples)) {
        return exampleContainer.examples.map(function (example, index) {
          return {
            name: 'Example ' + index,
            content: example
          };
        });
      } else {
        return Object.keys(exampleContainer.examples).sort().map(function (key) {
          return {
            name: key,
            content: exampleContainer.examples[key]
          };
        });
      }
    }
  }

  angular.module('RAML.Directives')
    .directive('examples', RAML.Directives.examples);
})();
