(function () {
  'use strict';

  RAML.Directives.closeButton = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/close-button.tpl.html',
      replace: true,
      controller: function($scope) {
        $scope.close = function () {
          var $inactiveElements = jQuery('.raml-console-tab').add('.raml-console-resource').add('li');


          $inactiveElements.removeClass('raml-console-is-active');
          $scope.showPanel = false;
        };
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('closeButton', RAML.Directives.closeButton);
})();
