'use strict';

(function() {
  RAML.Directives.basicAuth = function() {
    return {
      restrict: 'E',
      templateUrl: 'views/basic_auth.tmpl.html',
      replace: true,
      scope: {
        credentials: '='
      }
    };
  };
})();
