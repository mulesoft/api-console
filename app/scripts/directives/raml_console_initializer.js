(function() {
  'use strict';

  RAML.Directives.ramlConsoleInitializer = function() {
    var controller = function($scope) {
      $scope.consoleLoader = this;
    }

    controller.prototype.load = function() {
      this.locationSet = true;
    };

    var link = function($scope, $element, $attrs, controller) {
      if (document.location.search.indexOf("?raml=") != -1) {
        controller.location = document.location.search.replace("?raml=", '');
        controller.locationSet = true;
      }
    }

    return { restrict: 'E', controller: controller, link: link }
  }
})();
