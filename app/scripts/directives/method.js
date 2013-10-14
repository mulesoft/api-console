(function() {
  'use strict';

  var controller = function($scope) {
    $scope.methodView = this;
  };

  controller.prototype.toggleExpansion = function() {
    this.expanded = !this.expanded;
  };

  RAML.Directives.method = function() {
    return {
      controller: controller,
      restrict: 'E',
      templateUrl: 'views/method.tmpl.html',
      replace: true
    }
  }
})();
