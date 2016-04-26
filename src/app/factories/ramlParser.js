(function () {
  'use strict';

  angular.module('raml', [])
    .factory('ramlParser', function ramlParser(
      $http,
      $q,
      $window
    ) {
      return {
        load:     toQ(load),
        loadPath: toQ(loadPath)
      };

      // ---

      function load(text, contentAsyncFn) {
        var virtualPath = '/' + Date.now() + '.raml';
        return loadApi(virtualPath, function contentAsync(path) {
          return (path === virtualPath) ? $q.when(text) : (contentAsyncFn ? contentAsyncFn(path) : $q.reject(new Error('ramlParser: load: contentAsync: ' + path + ': no such path')));
        });
      }

      function loadPath(path, contentAsyncFn) {
        return loadApi(path, function contentAsync(path) {
          return contentAsyncFn ? contentAsyncFn(path) : $q.reject(new Error('ramlParser: loadPath: contentAsync: ' + path + ': no such path'));
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
            contentAsync: contentAsyncFn,
            content:      content
          },
          httpResolver:      {
            getResourceAsync: function getResourceAsync(url) {
              var proxy = (($window.RAML || {}).Settings || {}).proxy || '';
              var req = {
                method: 'GET',
                url: proxy + url,
                headers: {
                  'Accept': 'application/raml+yaml'
                },
                transformResponse: null
              };
              return $http(req)
                .then(function (res) {
                  return {content: res.data};
                })
              ;
            }
          }
        })
          .then(function (api) {
            api = api.expand();
            return api.toJSON();
          })
        ;

        // ---

        function content(path) {
          throw new Error('ramlParser: loadPath: loadApi: content: ' + path + ': no such path');
        }
      }
    })
  ;
})();
