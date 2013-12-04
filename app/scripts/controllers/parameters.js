'use strict';

(function() {
  function isEmpty(object) {
    return Object.keys(object || {}).length === 0;
  }

  var controller = function($scope) {
    var method = $scope.method;
    var resource = $scope.resource;
    var parameterGroups = [];

    if (!isEmpty(method.headers)) {
      parameterGroups.push(['Headers', method.headers]);
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

    if (!isEmpty(uriParameters)) {
      parameterGroups.push(['URI Parameters', uriParameters]);
    }
    if (!isEmpty(method.queryParameters)) {
      parameterGroups.push(['Query Parameters', method.queryParameters]);
    }

    $scope.parameterGroups = parameterGroups;
  };

  RAML.Controllers.Parameters = controller;
})();
