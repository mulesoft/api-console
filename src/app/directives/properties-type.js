(function () {
  'use strict';

  RAML.Directives.propertiesType = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/properties-type.tpl.html',
      scope: {
        type: '=',
        editMode: '=',
        model: '='
      },
      controller: ['$scope', 'TypeService', function ($scope, TypeService) {
        $scope.isNativeType = TypeService.isNativeType;

        $scope.$watch('type', function () {
          $scope.model.value = {};

          $scope.type.properties.forEach(function (property) {
            $scope.model.value[property.name] = {value: ''};
          });
        });
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('propertiesType', RAML.Directives.propertiesType);
})();
