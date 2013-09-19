(function() {
  'use strict';

  RAML.Directives.ramlConsoleInitializer = function() {
    var link = function($scope, $element, $attrs) {
    }

    var controller = function($scope) {
      $scope.consoleLoader = this;
    }

    controller.prototype.load = function() {
      this.locationSet = true;
    };

    return { restrict: 'E', controller: controller, link: link }
  }
})();
