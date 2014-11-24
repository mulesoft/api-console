'use strict';

(function() {
  RAML.Directives.oauth2 = function() {

    var GRANT_TYPES = [
      { name: 'Implicit', type: 'token' },
      { name: 'Authorization Code', type: 'code' },
      { name: 'Client Credentials', type: 'credentials' },
      { name: 'Resource Owner Password Credentials', type: 'owner' }
    ];

    var controller = function($scope) {
      var scopes              = $scope.scheme.settings.scopes || [];
      var authorizationGrants = $scope.scheme.settings.authorizationGrants;

      $scope.grantTypes = GRANT_TYPES.filter(function (grant) {
        return authorizationGrants.indexOf(grant.type) > -1;
      });

      $scope.credentials = {
        clientId: '',
        clientSecret: '',
        username: '',
        password: '',
        scopes: scopes.slice(),
        grantType: $scope.grantTypes[0]
      };

      $scope.toggleScope = function (scope) {
        var index = $scope.credentials.scopes.indexOf(scope);

        if (index === -1) {
          $scope.credentials.scopes.push(scope);
        } else {
          $scope.credentials.scopes.splice(index, 1);
        }
      };

      $scope.scopes = scopes;

      $scope.$watch('credentials.grantType.type', function (type) {
        $scope.hasClientSecret      = type !== 'token';
        $scope.hasOwnerCredentials  = type === 'owner';
        $scope.requiresClientSecret = $scope.hasClientSecret && type !== 'owner';
      });
    };

    return {
      restrict: 'E',
      templateUrl: 'views/oauth2.tmpl.html',
      replace: true,
      controller: controller,
      scope: {
        scheme: '=',
        credentials: '='
      }
    };
  };
})();
