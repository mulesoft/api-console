'use strict';

(function() {

  var Controller = function($scope) {
    $scope.placeholder = $scope.placeholder || $scope.definition.example;

    if ($scope.definition.type === 'file') {
      $scope.inputType = 'file';
    } else if (!!$scope.definition.enum) {
      $scope.inputType = 'enum';
    } else {
      $scope.inputType = 'default';
    }
  };

  RAML.Directives.parameterField = function() {
    return {
      restrict: 'E',
      templateUrl: 'views/parameter_field.tmpl.html',
      controller: Controller,
      scope: {
        name: '=',
        model: '=',
        definition: '=',
        placeholder: '=?',
        invalidClass: '@?',
        containedBy: '@'
      }
    };
  };
})();
