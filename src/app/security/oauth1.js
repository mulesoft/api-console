(function () {
  'use strict';

  RAML.Security.oauth1 = function() {
    return {
      restrict: 'E',
      templateUrl: 'security/oauth1.tpl.html',
      replace: true,
      scope: {
        credentials: '='
      }
    };
  };

  angular.module('RAML.Security')
    .directive('oauth1', RAML.Security.oauth1);
})();
