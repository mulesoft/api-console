(function() {
  'use strict';

  RAML.Directives.bodyDocumentation = function() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'views/body_documentation.tmpl.html',
      scope: {
        body: '=',
        keyBase: '='
      },
      controller: RAML.Controllers.BodyDocumentation
    };
  };
})();
