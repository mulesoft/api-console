(function () {
  'use strict';

  RAML.Directives.spinner = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/spinner.tpl.html',
      replace: true,
      link: function($scope, $element) {
        $scope.$on('loading-started', function() {
          $element.css({ 'display': ''});
        });

        $scope.$on('loading-complete', function() {
          $element.css({ 'display': 'none' });
        });
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('spinner', RAML.Directives.spinner);
})();
