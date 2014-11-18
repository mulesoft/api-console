(function () {
  'use strict';

  RAML.Security.basicAuth = function() {
    return {
      restrict: 'E',
      templateUrl: 'security/basic_auth.tpl.html',
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
    .directive('basicAuth', RAML.Security.basicAuth);
})();
