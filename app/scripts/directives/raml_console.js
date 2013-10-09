(function() {
  'use strict';

  var Controller = function($scope) {
    $scope.ramlConsole = this;
  };

  Controller.prototype.gotoView = function(view) {
    this.view = view;
  };

  RAML.Directives.ramlConsole = function(ramlParser) {
    var importAndParseRaml = function(src) {
      return ramlParser.loadFile(src).then(function (raml) {
        return raml;
      });
    }

    var link = function ($scope, $el, $attrs) {
      var success = function(raml) {
        $scope.api = RAML.Inspector.create(raml);
        $scope.$apply();
      }

      var error = function(error) {
        $scope.parseError = error;
        $scope.$apply();
      }

      // FIXME: move to a controller
      if ($scope.src) {
        importAndParseRaml($scope.src).then(success, error);
      }

      // FIXME: move this to the app on module('ramlConsoleApp').run...
      $scope.$on('event:raml-parsed', function(e, raml) {
        $scope.api = RAML.Inspector.create(raml);
      });
    }

    return {
      restrict: 'E',
      templateUrl: 'views/raml-console.tmpl.html',
      controller: Controller,
      scope: {
        src: '@'
      },
      link: link
    }
  };
})();
