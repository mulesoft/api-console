'use strict';

(function() {
  var Controller = function($scope) {
    $scope.displayParameters = function() {
      var parameters = $scope.parameters || {};
      parameters.plain = parameters.plain || {};
      parameters.parameterized = parameters.parameterized || {};

      return Object.keys(parameters.plain).length > 0 || Object.keys(parameters.parameterized).length > 0;
    };
  };

  RAML.Directives.namedParameters = function() {
    return {
      restrict: 'E',
      controller: Controller,
      templateUrl: 'views/named_parameters.tmpl.html',
      replace: true,
      scope: {
        heading: '@',
        parameters: '='
      }
    };
  };
})();
