(function() {
  'use strict';

  function isEmpty(object) {
    return Object.keys(object || {}).length == 0;
  }

  var controller = function($scope) {
    $scope.documentation = this;

    this.hasRequestParameters = $scope.resource.uriParameters || $scope.method.queryParameters;

    if ($scope.method.body && !isEmpty($scope.method.body['text/xml'])) {
      this.hasRequestDocumentation = true;
      if ($scope.method.body['text/xml'].schema) {
        this.hasRequestSchema = true;
      }
      if ($scope.method.body['text/xml'].example) {
        this.hasRequestExample = true;
      }
    }
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
