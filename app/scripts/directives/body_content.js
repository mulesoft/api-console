(function() {
  'use strict';

  RAML.Directives.bodyContent = function() {

    return {
      restrict: 'E',
      templateUrl: 'views/body_content.tmpl.html',
      replace: true,
      scope: {
        body: '='
      }
    };
  };
})();
