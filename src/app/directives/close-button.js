(function () {
  'use strict';

  RAML.Directives.closeButton = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/close-button.tpl.html',
      replace: true,
      controller: function($scope) {
        $scope.close = function () {
          var $inactiveElements = jQuery('.tab').add('.resource').add('li');

          $inactiveElements.removeClass('is-active');
          $scope.showPanel = false;
        };
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('closeButton', RAML.Directives.closeButton);
})();
