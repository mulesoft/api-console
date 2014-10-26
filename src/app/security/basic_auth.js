(function () {
  'use strict';

  RAML.Security.basicAuth = function() {
    return {
      restrict: 'E',
      templateUrl: 'security/basic_auth.tpl.html',
      replace: true,
      scope: {
        credentials: '='
      }
    };
  };

  angular.module('RAML.Security')
    .directive('basicAuth', RAML.Security.basicAuth);
})();
