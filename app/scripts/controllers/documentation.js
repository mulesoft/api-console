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
    $scope.generateKey = function(base, method) {
      return base + ':' + method.method;
    };

    function hasUriParameters() {
      return $scope.resource.pathSegments.some(function(segment) {
        return segment.templated;
      });
    }

    function hasParameters() {
      return !!(hasUriParameters() || $scope.method.queryParameters ||
        !RAML.Utils.isEmpty($scope.method.headers.plain) || hasFormParameters($scope.method));
    }

    function hasTraits(method) {
      return method.is && method.is.length > 0;
    }

    this.hasRequestDocumentation = function() {
      return hasTraits($scope.method) || !!$scope.method.description || hasParameters() || !RAML.Utils.isEmpty($scope.method.body);
    };

    this.hasResponseDocumentation = function() {
      return !RAML.Utils.isEmpty($scope.method.responses);
    };
  };

  controller.prototype.isEmpty = function(params) {
    return RAML.Utils.isEmpty(params);
  };

  RAML.Controllers.Documentation = controller;
})();
