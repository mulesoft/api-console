(function() {
  'use strict';

  function isEmpty(object) {
    return Object.keys(object || {}).length == 0;
  }

  var FORM_MIME_TYPES = ['application/x-www-form-urlencoded', 'multipart/form-data'];

  function hasFormParameters(method) {
    var body = method.body;

    if (body) {
      for (var i = 0; i < FORM_MIME_TYPES.length; i++) {
        var type = FORM_MIME_TYPES[i];

        if (body[type] && !isEmpty(body[type].formParameters))
          return true
      }
    }
    return false;
  }


  var controller = function($scope) {
    $scope.documentation = this;

    var method = $scope.method;

    this.hasParameterDocumentation = $scope.resource.uriParameters || method.queryParameters
      || method.headers || hasFormParameters(method);
    this.hasRequestDocumentation = !isEmpty(method.body);
    this.hasResponseDocumentation = !isEmpty(method.responses);
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
