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

    this.method = $scope.method;

    var hasParameters = !!($scope.resource.uriParameters || this.method.queryParameters ||
      this.method.headers || hasFormParameters(this.method));

    this.hasRequestDocumentation = hasParameters || !isEmpty(this.method.body);
    this.hasResponseDocumentation = !isEmpty(this.method.responses);
    this.hasTryIt = !!$scope.api.baseUri;
  };

  controller.prototype.traits = function() {
    return (this.method.is || []);
  };

  RAML.Controllers.Documentation = controller;
})();
