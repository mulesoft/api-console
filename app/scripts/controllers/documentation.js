(function() {
  'use strict';

  var FORM_MIME_TYPES = ['application/x-www-form-urlencoded', 'multipart/form-data'];

  function hasFormParameters(method) {
    return FORM_MIME_TYPES.some(function(type) {
      return method.body && method.body[type] && !RAML.Utils.isEmpty(method.body[type].formParameters);
    });
  }

  var controller = function($scope) {
    $scope.documentation = this;

    this.method = $scope.method;

    var hasUriParameters = $scope.resource.pathSegments.some(function(segment) {
      return segment.templated;
    });

    var hasParameters = !!(hasUriParameters || this.method.queryParameters ||
      !RAML.Utils.isEmpty(this.method.headers.plain) || hasFormParameters(this.method));

    this.hasRequestDocumentation = hasParameters || !RAML.Utils.isEmpty(this.method.body);
    this.hasResponseDocumentation = !RAML.Utils.isEmpty(this.method.responses);
    this.hasTryIt = !!$scope.api.baseUri;
  };

  controller.prototype.traits = function() {
    return (this.method.is || []);
  };

  RAML.Controllers.Documentation = controller;
})();
