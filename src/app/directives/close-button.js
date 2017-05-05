(function () {
  'use strict';

  var clearScope = function ($scope) {
    $scope.showPanel = false;
    $scope.showPanel = false;
    $scope.traits = null;
    $scope.methodInfo = {};
    $scope.currentId = null;
    $scope.currentMethod = null;
  };

  RAML.Directives.closeButton = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/close-button.tpl.html',
      replace: true,
      controller: ['$scope', '$rootScope', function($scope, $rootScope) {
        $scope.close = function () {
          $rootScope.$broadcast('resetData');
          $rootScope.$broadcast('methodClick', null, $rootScope.currentId);
          clearScope($scope);
          clearScope($scope.$parent);
          $rootScope.currentId = null;
        };
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('closeButton', RAML.Directives.closeButton);
})();
