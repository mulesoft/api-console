'use strict';

(function() {
  var Controller = function($scope) {
    var parameters = $scope.parameters || {
      plain: {},
      parameterized: {}
    };

    $scope.displayParameters = function() {
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
