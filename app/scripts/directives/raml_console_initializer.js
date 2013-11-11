(function() {
  'use strict';

  RAML.Directives.ramlConsoleInitializer = function(ramlParserWrapper) {
    var controller = function($scope) {
      $scope.consoleLoader = this;
    };

    controller.prototype.load = function() {
      ramlParserWrapper.load(this.location);
      this.finished = true;
    };

    controller.prototype.parse = function() {
      ramlParserWrapper.parse(this.raml);
      this.finished = true;
    };

    var link = function($scope, $element, $attrs, controller) {
      if (document.location.search.indexOf('?raml=') !== -1) {
        controller.location = document.location.search.replace('?raml=', '');
        controller.load();
      }
    };

    return { restrict: 'E', controller: controller, link: link };
  };
})();
