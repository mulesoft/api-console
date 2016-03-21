(function () {
  'use strict';

  RAML.Directives.property = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/property.tpl.html',
      scope: {
        property: '=',
        editMode: '=',
        model: '=',
        isArray: '='
      },
      controller: ['$scope', function ($scope) {
        $scope.type = convertType($scope.property);

        $scope.isValue = function (property) {
          return !property.enum;
        };

        $scope.isEnum = function (property) {
          return property.enum;
        };

        if ($scope.isArray) {

        }

        $scope.$watch('property', function (value) {
          $scope.type = convertType(value);
        });
      }]
    };
  };

  function convertType(property) {
    if (property.type === 'array') {
      return property.component.type + '[]';
    }
    return property.type;
  }

  angular.module('RAML.Directives')
    .directive('property', RAML.Directives.property);
})();
