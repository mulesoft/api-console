'use strict';

(function() {
  var controller = function($scope) {
    var method = $scope.method;
    var resource = $scope.resource;
    var parameterGroups = [];

    if (!RAML.Utils.isEmpty(method.headers.plain)) {
      parameterGroups.push(['Headers', method.headers.plain]);
    }

    var uriParameters = resource.pathSegments
      .map(function(segment) { return segment.parameters; })
      .filter(function(params) { return !!params; })
      .reduce(function(accum, parameters) {
        for (var key in parameters) {
          accum[key] = parameters[key];
        }
        return accum;
      }, {});

    if (!RAML.Utils.isEmpty(uriParameters)) {
      parameterGroups.push(['URI Parameters', uriParameters]);
    }
    if (!RAML.Utils.isEmpty(method.queryParameters)) {
      parameterGroups.push(['Query Parameters', method.queryParameters]);
    }

    $scope.parameterGroups = parameterGroups;
  };

  RAML.Controllers.Parameters = controller;
})();
