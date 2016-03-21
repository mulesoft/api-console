(function () {
  'use strict';

  RAML.Directives.unionType = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/union-type.tpl.html',
      scope: {
        type: '=',
        level: '@',
        model: '=',
        editMode: '='
      },
      controller: ['$scope', function($scope) {
        $scope.currentLevel = parseInt($scope.level, 10);
        $scope.nextLevel = $scope.currentLevel + 1;

        $scope.flattenedTypes = [];
        flattenUnionType($scope.type, $scope.flattenedTypes);
        $scope.selectedType = $scope.flattenedTypes[0];

        $scope.$watch('type', function (value) {
          $scope.flattenedTypes = [];
          flattenUnionType(value, $scope.flattenedTypes);
          $scope.selectedType = $scope.flattenedTypes[0];
        });

        $scope.selectType = function (type) {
          $scope.selectedType = type;
          $scope.model.value = '';
        };
      }]
    };
  };

  function flattenUnionType(type, types) {
    if (type.leftType.type !== 'union') {
      types.push(type.leftType);
    } else {
      flattenUnionType(type.leftType, types);
    }

    if (type.rightType.type !== 'union') {
      types.push(type.rightType);
    } else {
      flattenUnionType(type.rightType, types);
    }
  }

  angular.module('RAML.Directives')
    .directive('unionType', [RAML.Directives.unionType]);
})();
