(function () {
  'use strict';

  RAML.Directives.closeButton = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/close-button.tpl.html',
      replace: true,
      scope: {
        handleCloseClick: '&'
      },
      controller: ['$scope', function($scope) {
        $scope.close = function () {
          jQuery('.raml-console-tab.raml-console-is-active')
            .removeClass('raml-console-is-active');

          $scope.handleCloseClick()();
        };
      }]
    };
  };

  angular.module('RAML.Directives')
    .directive('closeButton', RAML.Directives.closeButton);
})();
