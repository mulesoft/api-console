(function () {
  'use strict';

  RAML.Security.oauth2 = function() {
    return {
      restrict: 'E',
      templateUrl: 'security/oauth2.tpl.html',
      replace: true,
      scope: {
        credentials: '='
      },
      controller: function ($scope) {
        $scope.ownerOptionsEnabled = function () {
          return $scope.credentials.grant.value === 'owner';
        };

        var grantsTypes = [
          {
            label: 'Implicit',
            value: 'token'
          },
          {
            label: 'Authorization Code',
            value: 'code'
          },
          {
            label: 'Resource Owner Password Credentials',
            value: 'owner'
          },
          {
            label: 'Client Credentials',
            value: 'credentials'
          }
        ];

        /* jshint camelcase: false */
        var authorizationGrants = $scope.$parent.securitySchemes.oauth_2_0.settings.authorizationGrants;

        if (authorizationGrants) {
          $scope.grants = grantsTypes.filter(function (el) {
            return authorizationGrants.indexOf(el.value) > -1;
          });
        }
        /* jshint camelcase: true */

        $scope.credentials.grant = $scope.grants[0];
      }
    };
  };

  angular.module('RAML.Security')
    .directive('oauth2', RAML.Security.oauth2);
})();
