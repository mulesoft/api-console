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

    function hasUriParameters() {
      return $scope.resource.pathSegments.some(function(segment) {
        return segment.templated;
      });
    }

    function hasParameters() {
      return !!(hasUriParameters() || $scope.method.queryParameters ||
        !RAML.Utils.isEmpty($scope.method.headers.plain) || hasFormParameters($scope.method));
    }

    this.hasRequestDocumentation = function() {
      return !!$scope.method.description || hasParameters() || !RAML.Utils.isEmpty($scope.method.body);
    };

    this.hasResponseDocumentation = function() {
      return !RAML.Utils.isEmpty($scope.method.responses);
    };

    var plainAndParameterizedHeaders = RAML.Utils.copy($scope.method.headers.plain);
    Object.keys($scope.method.headers.parameterized).forEach(function(parameterizedHeader) {
      plainAndParameterizedHeaders[parameterizedHeader] = $scope.method.headers.parameterized[parameterizedHeader].map(function(parameterized) {
        return parameterized.definition();
      });
    });
    $scope.plainAndParameterizedHeaders = plainAndParameterizedHeaders;
  };

  controller.prototype.isEmpty = function(params) {
    return RAML.Utils.isEmpty(params);
  };

  RAML.Controllers.Documentation = controller;
})();
