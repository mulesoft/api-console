(function () {
  'use strict';

  RAML.Directives.closeButton = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/close-button.tpl.html',
      replace: true,
      controller: function($scope, $rootScope) {
        $scope.close = function () {
          var $inactiveElements = jQuery('.raml-console-tab').add('.raml-console-resource').add('li');

          $rootScope.$broadcast('resetData');
          $inactiveElements.removeClass('raml-console-is-active');
          $scope.showPanel = false;
          $scope.traits = null;
          $scope.methodInfo = {};
        };
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('closeButton', RAML.Directives.closeButton);
})();
