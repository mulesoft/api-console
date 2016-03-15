(function () {
  'use strict';

  angular.module('RAML.Directives')
    .directive('ramlInitializer', function ramlInitializer() {
      return {
        restrict:    'E',
        templateUrl: 'directives/raml-initializer.tpl.html',
        replace:     true,
        controller:  'RamlInitializerController'
      };
    })
    .controller('RamlInitializerController', function RamlInitializerController(
      $scope,
      ramlParser
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
        return loadFromPromise(ramlParser.loadFile(url), {isLoadingFromUrl: true});
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
          .then(function (raml) {
            $scope.vm.raml = raml;
          })
          .catch(function (error) {
            $scope.vm.error           = error;
            $scope.vm.codeMirror.lint = lintFromError(error);
          })
          .finally(function () {
            $scope.vm.isLoading       = false;
            $scope.vm.isLoadedFromUrl = options.isLoadingFromUrl;
          })
        ;
      }

      function lintFromError(error) {
        return function getAnnotations() {
          return (error.parserErrors || []).map(function (error) {
            return {
              message:  error.message,
              severity: error.isWarning ? 'warning' : 'error',
              from:     CodeMirror.Pos(error.line),
              to:       CodeMirror.Pos(error.line)
            };
          });
        };
      }
    })
  ;
})();
