(function () {
  'use strict';

  RAML.Security.oauth2 = function() {
    return {
      restrict: 'E',
      templateUrl: 'security/oauth2.tpl.html',
      replace: true,
      controller: ['$scope', function ($scope) {
        $scope.onChange = function () {
          $scope.$parent.context.forceRequest = false;
        };

        $scope.ownerOptionsEnabled = function () {
          return $scope.credentials.grant === 'owner';
        };

        $scope.isImplicitEnabled = function () {
          return $scope.credentials.grant === 'token';
        };

        $scope.grants = [
          {
            label: 'Implicit',
            value: 'token'
          },
          {
            label: 'Implicit',
            value: 'implicit'
          },
          {
            label: 'Authorization Code',
            value: 'code'
          },
          {
            label: 'Authorization Code',
            value: 'authorization_code'
          },
          {
            label: 'Resource Owner Password Credentials',
            value: 'owner'
          },
          {
            label: 'Resource Owner Password Credentials',
            value: 'password'
          },
          {
            label: 'Client Credentials',
            value: 'credentials'
          },
          {
            label: 'Client Credentials',
            value: 'client_credentials'
          }
        ];

        /* jshint camelcase: false */
        $scope.getOAuth2Settings = function () {
          var result;
          for (var securitySchemesKey in $scope.$parent.securitySchemes) {
            if ($scope.$parent.securitySchemes.hasOwnProperty(securitySchemesKey)) {
              if ($scope.$parent.securitySchemes[securitySchemesKey].type === 'OAuth 2.0') {
                result = $scope.$parent.securitySchemes[securitySchemesKey].settings;
                break;
              }
            }
          }
          return result;
        };

        var oauth2Settings = $scope.getOAuth2Settings();
        var authorizationGrants = oauth2Settings.authorizationGrants;

        $scope.scopes = oauth2Settings.scopes;
        $scope.credentials.scopes = {};

        if (authorizationGrants) {
          $scope.grants = $scope.grants.filter(function (el) {
            return authorizationGrants.indexOf(el.value) > -1;
          });
        }
        /* jshint camelcase: true */

        $scope.credentials.grant = $scope.grants[0].value;
      }]
    };
  };


  angular.module('RAML.Security')
    .directive('oauth2', RAML.Security.oauth2);
})();
