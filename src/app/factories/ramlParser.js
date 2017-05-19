(function () {
  'use strict';

  angular.module('raml')
    .factory('ramlParser', ['$http', '$q', '$window', 'ramlExpander', function ramlParser(
      $http,
      $q,
      $window,
      ramlExpander
    ) {
      var jsonOptions=  {
        serializeMetadata: false,
        dumpSchemaContents: true,
        rootNodeDetails: true
      };

      return {
        load:     toQ(load),
        loadPath: toQ(loadPath)
      };

      // ---

      function load(text, contentAsyncFn, options) {
        var virtualPath = '/' + Date.now() + '.raml';
        return loadApi(virtualPath, function contentAsync(path) {
          return (path === virtualPath) ? $q.when(text) : (contentAsyncFn ? contentAsyncFn(path) : $q.reject(new Error('ramlParser: load: contentAsync: ' + path + ': no such path')));
        }, options);
      }

      function loadPath(path, contentAsyncFn, options) {
        return loadApi(path, function contentAsync(path) {
          return contentAsyncFn ? contentAsyncFn(path) : $q.reject(new Error('ramlParser: loadPath: contentAsync: ' + path + ': no such path'));
        }, options);
      }

      // ---

      function toQ(fn) {
        return function toQWrapper() {
          return $q.when(fn.apply(this, arguments));
        };
      }

      /**
       * @param  {String}   path
       * @param  {Function} contentAsyncFn
       * @param  {Object}   options
       * @param  {Boolean}  options.bypassProxy
       */
      function loadApi(path, contentAsyncFn, options) {
        options = options || {};
        return RAML.Parser.loadApi(path, {
          attributeDefaults: true,
          rejectOnErrors:    false,
          fsResolver:        {
            contentAsync: contentAsyncFn,
            content:      content
          },
          httpResolver:      {
            getResourceAsync: function getResourceAsync(url) {
              var settings = ($window.RAML || {}).Settings || {};
              var proxy    = (options.bypassProxy ? {} : settings).proxy || '';
              var req      = {
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
        }).then(function(api) {
          api = api.expand ? api.expand(true) : api;
          var raml = api.toJSON(jsonOptions);
          if (raml.specification) {
            return ramlExpander.expandRaml(raml.specification).then(function(){return raml;});
          }
          else {
            return Promise.resolve(raml);
          }
        });

        // ---

        function content(path) {
          throw new Error('ramlParser: loadPath: loadApi: content: ' + path + ': no such path');
        }
      }
    }])
  ;
})();
