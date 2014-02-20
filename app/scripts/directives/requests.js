'use strict';

(function() {
  RAML.Directives.requests = function() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'views/requests.tmpl.html',
      link: function($scope) {
        var displayed = {};
        $scope.displayed = function(contentType) {
          return displayed[contentType];
        };

        $scope.prepareView = function(name) {
          displayed[name] = true;
        };

        $scope.bodyKey = function() {
          return $scope.resourceView.methodKey() + ':body';
        };
      }
    };
  };
})();
