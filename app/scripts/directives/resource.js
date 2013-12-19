(function() {
  'use strict';

  RAML.Directives.resource = function() {
    return {
      restrict: 'E',
      templateUrl: 'views/resource.tmpl.html',
      replace: true,
      controller: RAML.Controllers.Resource
    };
  };
})();
