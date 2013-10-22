(function() {
  'use strict';

  RAML.Directives.rootDocumentation = function() {
    return {
      restrict: 'E',
      templateUrl: 'views/root_documentation.tmpl.html',
      replace: true
    };
  };
})();
