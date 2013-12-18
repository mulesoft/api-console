'use strict';

(function() {
  RAML.Directives.parameters = function() {
    return {
      restrict: 'E',
      templateUrl: 'views/parameters.tmpl.html',
      link: function(scope) {
        var plainAndParameterizedHeaders = RAML.Utils.copy(scope.method.headers.plain);
        Object.keys(scope.method.headers.parameterized).forEach(function(parameterizedHeader) {
          plainAndParameterizedHeaders[parameterizedHeader] = scope.method.headers.parameterized[parameterizedHeader].map(function(parameterized) {
            return parameterized.definition();
          });
        });
        scope.plainAndParameterizedHeaders = plainAndParameterizedHeaders;
      }
    };
  };
})();
