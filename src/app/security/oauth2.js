RAML.Security.oauth2 = function($window) {
  return {
    restrict: 'E',
    templateUrl: 'security/oauth2.tpl.html',
    replace: true,
    scope: {
      credentials: '='
    }
  };
};

angular.module('RAML.Security')
  .directive('oauth2', ['$window', RAML.Security.oauth2]);
