(function () {
  'use strict';

  angular.module('raml', [])
    .factory('ramlParser', function ramlParser(
      $q
    ) {
      return angular.extend({}, RAML.Parser, {
        load:     toQ(RAML.Parser.load),
        loadFile: toQ(RAML.Parser.loadFile)
      });

      // ---

      function toQ(fn) {
        return function toQWrapper() {
          return $q.when(fn.apply(this, arguments));
        };
      }
    })
  ;
})();
