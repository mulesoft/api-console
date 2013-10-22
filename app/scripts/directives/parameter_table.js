(function() {
  'use strict';

  RAML.Directives.parameterTable = function() {
    return {
      restrict: 'E',
      templateUrl: 'views/parameter_table.tmpl.html',
      replace: true,
      scope: {
        heading: '@',
        parameters: '='
      }
    };
  };
})();
