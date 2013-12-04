'use strict';

(function() {
  RAML.Directives.oauth1 = function() {
    return {
      restrict: 'E',
      templateUrl: 'views/oauth1.tmpl.html',
      replace: true,
      scope: {
        credentials: '='
      }
    };
  };
})();
