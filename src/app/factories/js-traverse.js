(function () {
  'use strict';

  angular.module('raml')
    .factory('jsTraverse', ['$window', function jsTraverse($window) {
      return {traverse: $window.traverse};
    }])
  ;
})();
