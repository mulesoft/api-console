'use strict';

(function() {
  RAML.Directives.parameterFields = function() {
    return {
      restrict: 'E',
      templateUrl: 'views/parameter_fields.tmpl.html',
      // replace: true,
      scope: {
        parameters: '=',
        requestData: '='
      }
    };
  };
})();
