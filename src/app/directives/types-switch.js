(function () {
  'use strict';

  RAML.Directives.typesSwitch = function(RecursionHelper) {
    return {
      restrict: 'E',
      templateUrl: 'directives/types-switch.tpl.html',
      scope: {
        type: '=',
        level: '@',
        hideType: '@',
        model: '=',
        isArray: '=',
        editMode: '='
      },
      controller: ['$scope', 'TypeService', function($scope, TypeService) {
        $scope.currentLevel = parseInt($scope.level, 10);
        $scope.nextLevel = $scope.currentLevel + 1;

        $scope.isNativeType = TypeService.isNativeType;
        $scope.isArrayType = TypeService.isArrayType;
        $scope.isUnionType = TypeService.isUnionType;
        $scope.isCustomType = TypeService.isCustomType;
        $scope.isProperties = TypeService.isProperties;

        $scope.showType = function (type) {
          return !$scope.hideType && !$scope.isArrayType(type) &&
            !$scope.isUnionType(type) && !$scope.isNativeType(type);
        };
      }],
      compile: function (element) {
        return RecursionHelper.compile(element);
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('typesSwitch', ['RecursionHelper', RAML.Directives.typesSwitch]);
})();
