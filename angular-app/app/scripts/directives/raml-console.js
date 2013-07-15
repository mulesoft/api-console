angular.module('ramlConsoleApp')
  .directive('ramlConsole', function ($rootScope) {
    return {
      restrict: 'E',
      templateUrl: '/views/raml-console.tmpl.html',
      replace: true,
      transclude: false,
      scope: { 'id': '@', 'definition': '@' },
      link: function ($scope, $element, $attributes) {
        $scope.resources = [];

        $rootScope.$on('event:raml-parsed', function (e, args) {
          $scope.resources = args.resources;
          $scope.$apply();
        });
      }
    };
  });

angular.module('ramlConsoleApp')
  .directive('ramlDefinition', function ($rootScope) {
    return {
      restrict: 'E',
      templateUrl: '/views/raml-definition.tmpl.html',
      replace: true,
      transclude: false,
      scope: { 'id': '@', 'src': '@' },
      controller: function ($scope, $element, $attrs) {
        var helper = new RamlParserHelper();

        RAML.Parser.loadFile($attrs.src)
          .done(function (result) {
            angular.forEach(result.resources, function (resource) {
              helper.massage(resource);
            });

            $rootScope.$emit('event:raml-parsed', result);
          });
      }
    };
  });

