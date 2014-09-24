RAML.Directives.resources = function(ramlParserWrapper) {
  return {
    restrict: 'E',
    templateUrl: 'resources/resources-list.tpl.html',
    replace: true,
    scope: {
        src: '@'
      },
    controller: function($scope, $element) {
      if ($scope.src) {
        ramlParserWrapper.load($scope.src);
      }
    },
    link: function($scope, $element) {
      ramlParserWrapper.onParseSuccess(function(raml) {
        // TODO: Make magic here!
        console.log(raml);
      });

      ramlParserWrapper.onParseError(function(error) {
        // Show errors!!!
        // $scope.parseError = error;
      });
    }
  };
};

angular.module('RAML.Directives')
  .directive('ramlResources', RAML.Directives.resources);
