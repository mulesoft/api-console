(function() {
  'use strict';

  var controller = function($scope) {
    $scope.documentation = this;
    this.currentTab = 'parameters';
  };

  controller.prototype.openTab = function(tab) {
    this.currentTab = tab;
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
