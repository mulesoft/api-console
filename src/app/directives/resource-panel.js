(function () {
  'use strict';

  RAML.Directives.resourcePanel = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/resource-panel.tpl.html',
      replace: true,
      controller: function($scope) {
        $scope.uriParameters = {};
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('resourcePanel', RAML.Directives.resourcePanel);
})();
