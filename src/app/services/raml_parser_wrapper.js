(function () {
  'use strict';

  RAML.Services.RAMLParserWrapper = function($rootScope, $http, ramlParser, $q) {
    var ramlProcessor, errorProcessor, whenParsed, PARSE_SUCCESS = 'event:raml-parsed';

    var load = function(file) {
      setPromise(ramlParser.loadApi(file, {
        rejectOnErrors: true,
        httpResolver: {
          getResourceAsync: function(path) {
            return $http.get(path, {
              transformResponse: function (data) {
                return data;
              }
            })
            .then(function (response) {
              return {
                content: response.data
              };
            });
          }
        }
      })
      .then(function (api) {
        api = api.expand();
        return api;
      }));
    };

    var parse = function(raml) {
      setPromise(ramlParser.loadApi('api.raml', {
        rejectOnErrors: true,
        fsResolver: {
          contentAsync: function (path) {
            if (path === '/api.raml') {
              var deferred = $q.defer();
              deferred.resolve(raml);
              return deferred.promise;
            }
          }
        }
      })
      .then(function (api) {
        api = api.expand();
        return api;
      }));
    };

    var onParseSuccess = function(cb) {
      ramlProcessor = function() {
        cb.apply(this, arguments);
        if (!$rootScope.$$phase) {
          // handle aggressive digesters!
          $rootScope.$digest();
        }
      };

      if (whenParsed) {
        whenParsed.then(ramlProcessor);
      }
    };

    var onParseError = function(cb) {
      errorProcessor = function() {
        cb.apply(this, arguments);
        if (!$rootScope.$$phase) {
          // handle aggressive digesters!
          $rootScope.$digest();
        }
      };

      if (whenParsed) {
        whenParsed.then(undefined, errorProcessor);
      }

    };

    var setPromise = function(promise) {
      whenParsed = promise;

      if (ramlProcessor || errorProcessor) {
        whenParsed.then(ramlProcessor, errorProcessor);
      }
    };

    $rootScope.$on(PARSE_SUCCESS, function(e, raml) {
      setPromise($q.when(raml));
    });

    return {
      load: load,
      parse: parse,
      onParseSuccess: onParseSuccess,
      onParseError: onParseError
    };
  };

  angular.module('RAML.Services')
    .service('ramlParserWrapper', ['$rootScope', '$http', 'ramlParser', '$q', RAML.Services.RAMLParserWrapper]);
})();
