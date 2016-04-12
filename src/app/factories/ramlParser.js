(function () {
  'use strict';

  angular.module('raml', [])
    .factory('ramlParser', function ramlParser(
      $http,
      $q
    ) {
      return {
        load:     toQ(load),
        loadFile: toQ(loadFile)
      };

      // ---

      function load(text) {
        var virtualPath = '/' + Date.now() + '.raml';
        return loadApi(virtualPath, function contentAsync(path) {
          return (path === virtualPath) ? $q.when(text) : $q.reject(new Error('contentAsync: ' + path + ': path does not exist'));
        });
      }

      function loadFile(path) {
        return loadApi(path, function contentAsync(path) {
          return $http.get(path, {responseType: 'text'})
            .then(function (res) {
              return res.data;
            })
          ;
        });
      }

      // ---

      function toQ(fn) {
        return function toQWrapper() {
          return $q.when(fn.apply(this, arguments));
        };
      }

      function loadApi(path, contentAsyncFn) {
        return RAML.Parser.loadApi(path, {
          attributeDefaults: true,
          rejectOnErrors:    true,
          fsResolver:        {
            contentAsync: contentAsyncFn
          }
        })
          .then(function (api) {
            api = api.expand();
            return api.toJSON();
          })
        ;
      }
    })
  ;
})();
