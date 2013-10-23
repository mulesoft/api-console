'use strict';

(function() {
  RAML.Directives.securitySchemes = function() {
    return {
      restrict: 'E',
      templateUrl: 'views/security_schemes.tmpl.html',
      replace: true,
      scope: {
        schemes: '=',
        keychain: '='
      }
    };
  };
})();
