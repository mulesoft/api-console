'use strict';

angular.module('ramlConsoleApp')
    .directive('ramlConsole', function (ramlReader, $rootScope) {
        return {
            restrict: 'E',
            templateUrl: 'views/raml-console.tmpl.html',
            replace: true,
            transclude: false,
            scope: {
                'id': '@',
                'definition': '@'
            },

            link: function ($scope) {
                $scope.resources = [];
                $scope.consoleSettings = { displayTryIt: true };

                $scope.$on('event:raml-parsed', function (e, args) {
                    var definition = ramlReader.read(args)
                    $scope.baseUri = ramlReader.processBaseUri(definition);
                    $scope.resources = definition.resources;
                    $scope.documentation = definition.documentation;
                    $scope.$apply();
                });
            }
        };
    });

angular.module("ramlConsoleApp").run(["$rootScope", "eventService", "ramlReader", function($rootScope, eventService, ramlReader) {
  $rootScope.$on('event:raml-parsed', function (e, args) {
      var definition = ramlReader.read(args)
      eventService.broadcast('event:raml-operation-list-published', definition.resources);
      $rootScope.$apply();
  });
}]);
