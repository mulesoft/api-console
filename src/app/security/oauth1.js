(function () {
  'use strict';

  RAML.Security.oauth1 = function() {
    return {
      restrict: 'E',
      templateUrl: 'security/oauth1.tpl.html',
      replace: true,
      scope: {
        credentials: '='
      },
      controller: function ($scope) {
        $scope.onChange = function () {
          $scope.$parent.context.forceRequest = false;
        };
      }
    };
  };

  angular.module('RAML.Security')
    .directive('oauth1', RAML.Security.oauth1);
})();
