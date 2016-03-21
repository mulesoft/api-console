(function () {
  'use strict';

  RAML.Directives.customType = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/custom-type.tpl.html',
      scope: {
        type: '=',
        editMode: '=',
        level: '@',
        model: '='
      },
      controller: ['$scope', 'TypeService', function ($scope, TypeService) {
        $scope.currentLevel = parseInt($scope.level, 10);
        $scope.nextLevel = $scope.currentLevel + 1;

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
    .directive('customType', RAML.Directives.customType);
})();
