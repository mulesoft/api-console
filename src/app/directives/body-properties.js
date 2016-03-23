(function () {
  'use strict';

  RAML.Directives.bodyProperties = function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/body-properties.tpl.html',
      replace: true,
      scope: {
        type: '='
      },
      controller: function ($scope) {
        $scope.properties = {
          body: [$scope.type]
        };
      }
    };
  };

  angular.module('RAML.Directives')
    .directive('bodyProperties', RAML.Directives.bodyProperties);
})();
