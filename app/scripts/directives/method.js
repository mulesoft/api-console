(function() {
  'use strict';

  var controller = function($scope) {
    $scope.methodView = this;
    this.currentTab = 'documentation';
  };

  controller.prototype.toggleExpansion = function() {
    this.expanded = !this.expanded;
  };

  controller.prototype.openTab = function(tab, $event) {
    if (this.expanded)
      $event.stopPropagation();

    this.currentTab = tab;
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
