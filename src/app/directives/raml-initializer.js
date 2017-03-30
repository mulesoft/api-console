(function () {
  'use strict';

  angular.module('RAML.Directives')
    .directive('ramlInitializer', function ramlInitializer() {
      return {
        restrict:    'E',
        templateUrl: 'directives/raml-initializer.tpl.html',
        replace:     true,
        controller:  'RamlInitializerController',
        scope:       {
          options: '='
        }
      };
    })
    .controller('RamlInitializerController', ['$scope', '$window', 'ramlParser', function RamlInitializerController(
      $scope, $window, ramlParser
    ) {
      $scope.vm = {
        codeMirror: {
          gutters:      ['CodeMirror-lint-markers'],
          lineNumbers:  true,
          lineWrapping: true,
          lint:         null,
          mode:         'yaml',
          tabSize:      2,
          theme:        'raml-console'
        },

        error:           null,
        isLoadedFromUrl: false,
        isLoading:       false,
        loadFromString:  loadFromString,
        loadFromUrl:     loadFromUrl,
        raml:            null
      };

      // ---

      (function activate() {
        if (document.location.search.indexOf('?raml=') !== -1) {
          loadFromUrl(document.location.search.replace('?raml=', ''));
        }
      })();

      // ---

      function loadFromUrl(url) {
        $scope.vm.ramlUrl = url;
        if(RAML.LoaderUtils.ramlOriginValidate(url, $scope.options)) {
          $scope.vm.isLoadedFromUrl = true;
          $scope.vm.error = {message : 'RAML origin check failed. Raml does not reside underneath the path:' + RAML.LoaderUtils.allowedRamlOrigin($scope.options)};
        } else {
          return loadFromPromise(ramlParser.loadPath($window.resolveUrl(url)), {isLoadingFromUrl: true});
        }
      }

      function loadFromString(string) {
        $scope.vm.ramlString = string;
        return loadFromPromise(ramlParser.load(string));
      }

      // ---

      /**
       * @param {Promise} promise
       * @param {Boolean} options.isLoadingFromUrl
       */
      function loadFromPromise(promise, options) {
        options                   = options || {};
        $scope.vm.error           = null;
        $scope.vm.raml            = null;
        $scope.vm.isLoading       = true;
        $scope.vm.isLoadedFromUrl = false;
        $scope.vm.codeMirror.lint = null;

        return promise
          .then(function (api) {
            var success = true;
            var issues = api.errors; // errors and warnings
            if (issues && issues.length > 0) {
              success = issues.filter(function (issue) {
                  return !issue.isWarning;
                }).length === 0;
            }

            if (success) {
              $scope.vm.raml = api.specification;
            } else {
              $scope.vm.error           = { message: 'Api contains errors.', errors: issues};
              $scope.vm.codeMirror.lint = lintFromError(issues);
            }
          })
          .finally(function () {
            $scope.vm.isLoading       = false;
            $scope.vm.isLoadedFromUrl = options.isLoadingFromUrl;
          })
        ;
      }

      function lintFromError(errors) {
        return function getAnnotations() {
          return (errors || []).map(function (error) {
            return {
              message:  error.message,
              severity: error.isWarning ? 'warning' : 'error',
              from:     CodeMirror.Pos(error.line),
              to:       CodeMirror.Pos(error.line)
            };
          });
        };
      }
    }])
  ;
})();
