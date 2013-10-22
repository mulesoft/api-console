(function() {
  'use strict';

  RAML.Directives.apiResources = function() {

    return {
      restrict: 'E',
      templateUrl: 'views/api_resources.tmpl.html',
      replace: true
    };
  };
})();
