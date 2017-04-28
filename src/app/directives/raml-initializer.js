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
          return loadFromPromise(ramlParser.loadFile($window.resolveUrl(url)), {isLoadingFromUrl: true});
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
          .then(function (ramlData) {
            $scope.$apply(function() {
              $scope.vm.raml = ramlData;

              $scope.vm.isLoading       = false;
              $scope.vm.isLoadedFromUrl = options.isLoadingFromUrl;
            });
            console.timeEnd('raml:parse');
          }, function(errorMsg){
            $scope.$apply(function() {
              $scope.vm.error = {message: 'Api contains errors.', errors: errorMsg};

              $scope.vm.isLoading       = false;
              $scope.vm.isLoadedFromUrl = options.isLoadingFromUrl;
            });
          })
        ;
      }
    }])
  ;
})();
