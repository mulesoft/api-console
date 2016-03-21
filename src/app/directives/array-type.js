(function () {
  'use strict';

  RAML.Directives.arrayType = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/array-type.tpl.html',
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
          $scope.model.value = [];
          $scope.model.value.push({value: ''});
        });

        $scope.addNewItem = function () {
          $scope.model.value.push({value: ''});
        };

        $scope.removeItem = function (index) {
          $scope.model.value.splice(index, 1);
        };
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('arrayType', RAML.Directives.arrayType);
})();
