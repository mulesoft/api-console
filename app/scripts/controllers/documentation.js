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

    this.resource = $scope.resource;
    this.method = $scope.method;
  };

  controller.prototype.hasUriParameters = function() {
    return this.resource.pathSegments.some(function(segment) {
      return segment.templated;
    });
  };

  controller.prototype.hasParameters = function() {
    return !!(this.hasUriParameters() || this.method.queryParameters ||
      !RAML.Utils.isEmpty(this.method.headers.plain) || hasFormParameters(this.method));
  };

  controller.prototype.hasRequestDocumentation = function() {
    return this.hasParameters() || !RAML.Utils.isEmpty(this.method.body);
  };

  controller.prototype.hasResponseDocumentation = function() {
    return !RAML.Utils.isEmpty(this.method.responses);
  };

  controller.prototype.traits = function() {
    return (this.method.is || []);
  };

  RAML.Controllers.Documentation = controller;
})();
