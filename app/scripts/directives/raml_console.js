(function() {
  'use strict';

  RAML.Directives.ramlConsole = function(ramlParser) {
    var importAndParseRaml = function(src) {
      return ramlParser.loadFile(src).then(function (raml) {
        return raml;
      });
    }

    var link = function ($scope, $el, $attrs) {
      var success = function(raml) {
        $scope.api = RAML.Inspector.create(raml);
        $scope.$apply();
      }

      var error = function(error) {
        $scope.parseError = error;
        $scope.$apply();
      }

      importAndParseRaml($scope.src).then(success, error);
    }

    return {
      restrict: 'E',
      templateUrl: 'views/raml-console.tmpl.html',
      scope: {
        src: '@'
      },
      link: link
    }
  };
})();
