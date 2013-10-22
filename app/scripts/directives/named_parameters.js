'use strict';

(function() {
  RAML.Directives.namedParameters = function() {
    return {
      restrict: 'E',
      link: function() {},
      templateUrl: 'views/named_parameters.tmpl.html',
      replace: true,
      scope: {
        heading: '@',
        parameters: '=',
        requestData: '='
      }
    };
  };
})();
