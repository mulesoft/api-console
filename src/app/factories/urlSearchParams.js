(function () {
  'use strict';

  angular.module('raml')
    .factory('urlSearchParams', ['$window', '$location', function($window, $location) {

      function search() {
        var left = $window.location.search
          .split(/[&||?]/)
          .filter(function (x) {
            return x.indexOf('=') > -1;
          })
          .map(function (x) {
            return x.split(/=/);
          })
          .map(function (x) {
            x[1] = x[1].replace(/\+/g, ' ');
            return x;
          })
          .reduce(function (acc, current) {
            acc[current[0]] = current[1];
            return acc;
          }, {});

        var right = $location.search() || {};

        return Object.keys(right)
          .reduce(function (acc, current) {
            acc[current] = right[current];
            return acc;
          }, left);
      }

      return {
        search: search
      };
    }]);

}());
