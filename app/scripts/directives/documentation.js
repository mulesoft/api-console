(function() {
  'use strict';

  RAML.Directives.documentation = function() {
    return {
      controller: RAML.Controllers.Documentation,
      restrict: 'E',
      templateUrl: 'views/documentation.tmpl.html',
      replace: true
    };
  };
})();
