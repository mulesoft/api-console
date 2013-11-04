'use strict';

(function() {
  function isEmpty(object) {
    return Object.keys(object || {}).length === 0;
  }

  var FORM_MIME_TYPES = ['application/x-www-form-urlencoded', 'multipart/form-data'];

  function hasFormParameters(method) {
    return FORM_MIME_TYPES.some(function(type) {
      return method.body && method.body[type] && !isEmpty(method.body[type].formParameters);
    });
  }

  var controller = function($scope) {
    $scope.documentation = this;

    var method = $scope.method;

    var hasParameters = !!($scope.resource.uriParameters || method.queryParameters ||
      method.headers || hasFormParameters(method));

    this.hasRequestDocumentation = hasParameters || !isEmpty(method.body);
    this.hasResponseDocumentation = !isEmpty(method.responses);
    this.hasTryIt = !!$scope.api.baseUri;
  };

  RAML.Controllers.Documentation = controller;
})();
