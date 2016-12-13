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

        $scope.changeExample = function(example) {
          $scope.currentExample = example;
        };

        $scope.$watch('exampleContainer', function (value) {
          $scope.examples = transformExample(value);
          $scope.currentExample = 0;

          $scope.isXML = value.name === 'application/xml';
        });
      }]
    };
  };

  function transformExample(exampleContainer) {
    if (exampleContainer.example) {
      return [{
        name: 'Example',
        content: (typeof exampleContainer.example === 'object') ?
            JSON.stringify(exampleContainer.example, null, 2) : exampleContainer.example
      }];
    } else if (exampleContainer.examples) {
      if (Array.isArray(exampleContainer.examples)) {
        return exampleContainer.examples.map(function (example, index) {
          return {
            name: example.name || 'Example ' + index,
            content: (typeof example.value === 'object') ?
                JSON.stringify(example.value, null, 2) : example.value
          };
        });
      } else {
        return Object.keys(exampleContainer.examples).sort().map(function (key) {
          return {
            name: key,
            content: exampleContainer.examples[key].value
          };
        });
      }
    }
  }

  angular.module('RAML.Directives')
    .directive('examples', RAML.Directives.examples);
})();
