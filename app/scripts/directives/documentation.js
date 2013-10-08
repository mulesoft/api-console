(function() {
  'use strict';

  function isEmpty(object) {
    return Object.keys(object || {}).length == 0;
  }

  var controller = function($scope) {
    $scope.documentation = this;

    this.hasParameterDocumentation = $scope.resource.uriParameters || $scope.method.queryParameters || $scope.method.headers;
    this.hasRequestDocumentation = !isEmpty($scope.method.body);
    this.hasResponseDocumentation = !isEmpty($scope.method.responses);
  };

  controller.prototype.toggleExpansion = function(response) {
    response.collapsed = !response.collapsed;
  };

  RAML.Directives.documentation = function() {
    return {
      controller: controller,
      restrict: 'E',
      templateUrl: 'views/documentation.tmpl.html',
      replace: true
    }
  }
})();
