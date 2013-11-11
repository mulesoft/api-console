(function() {
  'use strict';

  var controller = function($scope, $attrs, ramlParserWrapper) {
    $scope.ramlConsole = this;

    if ($attrs.hasOwnProperty('withRootDocumentation')) {
      this.withRootDocumentation = true;
    }

    if ($scope.src) {
      ramlParserWrapper.load($scope.src);
    }

    this.keychain = {};
  };

  controller.prototype.gotoView = function(view) {
    this.view = view;
  };

  controller.prototype.showRootDocumentation = function() {
    return this.withRootDocumentation && this.api && this.api.documentation && this.api.documentation.length > 0;
  };

  RAML.Controllers.RAMLConsole = controller;
})();
