'use strict';

(function() {
  RAML.Directives.oauth2 = function() {
    return {
      restrict: 'E',
      templateUrl: 'views/oauth2.tmpl.html',
      replace: true,
      scope: {
        credentials: '='
      }
    };
  };
})();
