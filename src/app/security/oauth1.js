RAML.Security.oauth1 = function($window) {
  return {
    restrict: 'E',
    templateUrl: 'security/oauth1.tpl.html',
    replace: true,
    scope: {
      credentials: '='
    }
  };
};

angular.module('RAML.Security')
  .directive('oauth1', ['$window', RAML.Security.oauth1]);
