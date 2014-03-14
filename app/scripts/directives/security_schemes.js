'use strict';

(function() {
  RAML.Directives.securitySchemes = function() {

    var controller = function($scope) {
      $scope.securitySchemes = this;
    };

    controller.prototype.supports = function(scheme) {
      return scheme.type === 'OAuth 2.0' ||
        scheme.type === 'OAuth 1.0' ||
        scheme.type === 'Basic Authentication';
    };

    return {
      restrict: 'E',
      templateUrl: 'views/security_schemes.tmpl.html',
      replace: true,
      controller: controller,
      scope: {
        schemes: '=',
        keychain: '=',
        baseKey: '='
      }
    };
  };
})();
