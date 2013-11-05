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
    if (!isEmpty(resource.uriParameters)) {
      parameterGroups.push(['URI Parameters', resource.uriParameters]);
    }
    if (!isEmpty(method.queryParameters)) {
      parameterGroups.push(['Query Parameters', method.queryParameters]);
    }

    if (method.body) {
      var normalForm = method.body['application/x-www-form-urlencoded'];
      var multipartForm = method.body['multipart/form-data'];

      if (normalForm && !isEmpty(normalForm.formParameters)) {
        parameterGroups.push(['Form Parameters', normalForm.formParameters]);
      }
      if (multipartForm && !isEmpty(multipartForm.formParameters)) {
        parameterGroups.push(['Multipart Form Parameters', multipartForm.formParameters]);
      }
    }

    $scope.parameterGroups = parameterGroups;
  };

  RAML.Controllers.Parameters = controller;
})();
