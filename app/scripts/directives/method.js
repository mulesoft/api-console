(function() {
  'use strict';

  RAML.Directives.method = function() {
    return {
      controller: RAML.Controllers.Method,
      require: ['^resource', 'method'],
      restrict: 'E',
      templateUrl: 'views/method.tmpl.html',
      replace: true
    };
  };
})();
