(function() {
  'use strict';

  var controller = function($scope) {
    $scope.methodView = this;
    this.method = $scope.method;
  };

  controller.prototype.toggleExpansion = function() {
    this.expanded = !this.expanded;
  };

  controller.prototype.cssClass = function() {
    if (this.expanded) {
      return 'expanded ' + this.method.method;
    } else {
      return 'collapsed ' + this.method.method;
    }
  };

  RAML.Directives.method = function() {
    return {
      controller: controller,
      restrict: 'E',
      templateUrl: 'views/method.tmpl.html',
      replace: true
    };
  };
})();
