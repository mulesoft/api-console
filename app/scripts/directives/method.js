(function() {
  'use strict';

  RAML.Directives.method = function() {
    return {
      restrict: 'E',
      templateUrl: 'views/method.tmpl.html',
      replace: true
    };
  };
})();
