RAML.Security.basicAuth = function($window) {
  return {
    restrict: 'E',
    templateUrl: 'security/basic_auth.tpl.html',
    replace: true,
    scope: {
      credentials: '='
    }
  };
};

angular.module('RAML.Security')
  .directive('basicAuth', ['$window', RAML.Security.basicAuth]);
