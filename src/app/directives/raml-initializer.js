(function () {
  'use strict';

  RAML.Directives.ramlInitializer = function(ramlParserWrapper) {
    return {
      restrict: 'E',
      templateUrl: 'directives/raml-initializer.tpl.html',
      replace: true,
      controller: ['$scope', '$window', function($scope, $window) {
        $scope.ramlUrl    = '';

        ramlParserWrapper.onParseError(function(errors) {
          errors.parserErrors = errors.parserErrors || [];
          $scope.errors = errors.parserErrors.map(function (error) {
            return {
              errorMessage: error.message,
              line: error.line,
              column: error.column
            };
          });

          if (!$scope.isLoadedFromUrl) {
            $scope.errors.forEach(function (error) {
              $window.ramlErrors.push({
                line: error.line,
                message: error.errorMessage
              });

              // Hack to update codemirror
              setTimeout(function () {
                // Editor needs to be obtained after the timeout.
                var editor = jQuery('.raml-console-initializer-input-container .CodeMirror')[0].CodeMirror;
                editor.addLineClass(error.line, 'background', 'line-error');
                editor.doc.setCursor(error.line);
              }, 10);
            });
          }

          $scope.ramlStatus = null;
        });

        ramlParserWrapper.onParseSuccess(function() {
          $scope.ramlStatus = 'loaded';
        });

        $scope.onChange = function () {
          $scope.errorMessage = null;
        };

        $scope.onKeyPressRamlUrl = function ($event) {
          if ($event.keyCode === 13) {
            $scope.loadFromUrl();
          }
        };

        $scope.loadFromUrl = function () {
          if ($scope.ramlUrl) {
            $scope.isLoadedFromUrl = true;
            $scope.ramlStatus      = 'loading';
            ramlParserWrapper.load($scope.ramlUrl);
          }
        };

        $scope.loadRaml = function() {
          if ($scope.raml) {
            $scope.ramlStatus      = 'loading';
            $scope.isLoadedFromUrl = false;
            ramlParserWrapper.parse($scope.raml);
          }
        };

        if (document.location.search.indexOf('?raml=') !== -1) {
          $scope.ramlUrl = document.location.search.replace('?raml=', '');
          $scope.loadFromUrl();
        }
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('ramlInitializer', ['ramlParserWrapper', RAML.Directives.ramlInitializer]);
})();
