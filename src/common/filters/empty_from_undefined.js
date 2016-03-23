(function() {
  'use strict';

  RAML.Filters.emptyFromUndefined = function() {
    return function(input) {
      return (input === undefined) ? '' : input;
    };
  };

  angular.module('RAML.Filters')
    .filter('emptyFromUndefined', RAML.Filters.emptyFromUndefined);
})();
