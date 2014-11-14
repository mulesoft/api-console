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
      var authorizationGrants = $scope.scheme.settings.authorizationGrants;

      $scope.grantTypes = GRANT_TYPES.filter(function (grant) {
        return authorizationGrants.indexOf(grant.type) > -1;
      });

      $scope.credentials = {
        clientId: '',
        clientSecret: '',
        username: '',
        password: '',
        grantType: $scope.grantTypes[0]
      };

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
