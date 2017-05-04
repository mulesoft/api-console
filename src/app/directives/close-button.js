(function () {
  'use strict';

  RAML.Directives.closeButton = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/close-button.tpl.html',
      replace: true,
      controller: ['$scope', '$rootScope', function($scope, $rootScope) {
        $scope.close = function () {
          $rootScope.$broadcast('resetData');
          $rootScope.$broadcast('methodClick', null, $rootScope.currentId);
          $scope.showPanel = false;
          $scope.traits = null;
          $scope.methodInfo = {};
          $scope.currentId               = null;
          $rootScope.currentId           = null;
          $rootScope.currentMethod       = null;
        };
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('closeButton', RAML.Directives.closeButton);
})();
