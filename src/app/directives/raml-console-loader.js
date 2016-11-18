(function () {
  'use strict';

  angular.module('RAML.Directives')
    .directive('ramlConsoleLoader', function ramlConsoleLoader() {
      return {
        restrict:    'E',
        templateUrl: 'directives/raml-console-loader.tpl.html',
        replace:     true,
        controller:  'RamlConsoleLoaderController',
        scope:       {
          src:     '@',
          options: '='
        }
      };
    })
    .controller('RamlConsoleLoaderController', function RamlConsoleLoaderController(
      $scope,
      $window,
      ramlParser
    ) {
      $scope.vm = {
        error:   void(0),
        loaded:  false,
        options: $scope.options,
        raml:    void(0),
        src:     $scope.src
      };

      // ---

      (function activate() {
        loadFromUrl($scope.vm.src);
      })();

      // ---

      function loadFromUrl(url) {
        $scope.vm.raml   = void(0);
        $scope.vm.loaded = false;
        $scope.vm.error  = void(0);

        if(RAML.LoaderUtils.ramlOriginValidate(url, $scope.options)) {
          $scope.vm.error = {message : 'RAML origin check failed. Raml does not reside underneath the path:' + RAML.LoaderUtils.allowedRamlOrigin($scope.options)};
        } else {
          return ramlParser.loadPath($window.resolveUrl(url), null, $scope.options)
            .then(function (raml) {
              $scope.vm.raml = raml;
            })
            .catch(function (error) {
              $scope.vm.error = error;
            })
            .finally(function () {
              $scope.vm.loaded = true;
            })
          ;
        }
      }
    })
  ;
})();
