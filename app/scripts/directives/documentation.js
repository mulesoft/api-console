(function() {
  'use strict';

  var controller = function($scope) {
    $scope.documentation = this;
  };

  RAML.Directives.documentation = function() {
    return {
      controller: controller,
      restrict: 'E',
      templateUrl: 'views/documentation.tmpl.html',
      replace: true
    }
  }
})();
