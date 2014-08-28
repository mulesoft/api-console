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
    this.config   = RAML.Services.Config.config;
    this.settings = RAML.Settings;
  };

  controller.prototype.gotoView = function(view) {
    this.view = view;
  };

  controller.prototype.tryItEnabled = function() {
    return !!(this.api && this.api.baseUri);
  };

  controller.prototype.showRootDocumentation = function() {
    return this.withRootDocumentation && this.api && this.api.documentation && this.api.documentation.length > 0;
  };

  RAML.Controllers.RAMLConsole = controller;
})();
