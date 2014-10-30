(function () {
  'use strict';

  RAML.Directives.ramlInitializer = function(ramlParserWrapper) {
    return {
      restrict: 'E',
      templateUrl: 'directives/raml-initializer.tpl.html',
      replace: true,
      controller: function($scope) {
        $scope.ramlLoaded = false;
        $scope.ramlUrl    = '';

        $scope.onKeyPressRamlUrl = function ($event) {
          if ($event.keyCode === 13) {
            $scope.loadFromUrl();
          }
        };

        $scope.loadFromUrl = function () {
          if ($scope.ramlUrl) {
            ramlParserWrapper.load($scope.ramlUrl);
            $scope.ramlLoaded = true;
          }
        };

        $scope.loadRaml = function() {
          if ($scope.raml) {
            ramlParserWrapper.parse($scope.raml);
            $scope.ramlLoaded = true;
          }
        };

        if (document.location.search.indexOf('?raml=') !== -1) {
          $scope.ramlUrl = document.location.search.replace('?raml=', '');
          $scope.loadFromUrl();
        }
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('ramlInitializer', RAML.Directives.ramlInitializer);
})();
