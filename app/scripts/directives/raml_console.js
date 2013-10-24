(function() {
  'use strict';

  var Controller = function($scope, $attrs, ramlParser) {
    $scope.ramlConsole = this;

    if ($attrs.hasOwnProperty('withRootDocumentation')) {
      this.withRootDocumentation = true;
    }

    var success = function(raml) {
      try {
        $scope.api = this.api = RAML.Inspector.create(raml);
        $scope.$apply();
      } catch (e) {
        console.error(e);
      }
    };

    var error = function(error) {
      $scope.parseError = error;
      $scope.$apply();
    };

    if ($scope.src) {
      ramlParser.loadFile($scope.src).then(success.bind(this), error);
    }

    this.keychain = {};
  };

  Controller.prototype.gotoView = function(view) {
    this.view = view;
  };

  Controller.prototype.showRootDocumentation = function() {
    return this.withRootDocumentation && this.api && this.api.documentation && this.api.documentation.length > 0;
  };

  RAML.Directives.ramlConsole = function() {

    var link = function ($scope, $el, $attrs, controller) {
      // FIXME: move this to the app on module('ramlConsoleApp').run...
      $scope.$on('event:raml-parsed', function(e, raml) {
        $scope.api = controller.api = RAML.Inspector.create(raml);
      });
    };

    return {
      restrict: 'E',
      templateUrl: 'views/raml-console.tmpl.html',
      controller: Controller,
      scope: {
        src: '@'
      },
      link: link
    };
  };
})();
