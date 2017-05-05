(function () {
  'use strict';

  angular.module('RAML.Directives')
    .factory('resourceId', [function resourceId() {
      return function(resource) {
        return jQuery.trim(resource.pathSegments.toString().replace(/\W/g, ' ')).replace(/\s+/g, '_');
      };
    }]);
})();
