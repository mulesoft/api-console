(function () {
  'use strict';

  angular.module('RAML.Directives')
    .factory('resourceId', ['idGenerator', function resourceId(idGenerator) {
      return function(resource) {
        return idGenerator(resource.pathSegments.toString());
      };
    }]);
})();
