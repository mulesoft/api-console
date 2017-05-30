(function () {
  'use strict';

  angular.module('RAML.Directives')
    .factory('idGenerator', [function idGenerator() {
      return function(value) {
        var id = jQuery.trim(value.replace(/\W/g, ' ')).replace(/\s+/g, '_');
        return id === '' ? '-' : id;
      };
    }]);
})();
