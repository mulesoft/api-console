'use strict';

angular.module('ramlConsoleApp')
    .directive('ramlConsole', function ($rootScope, ramlReader) {
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

                $rootScope.$on('event:raml-parsed', function (e, args) {
                    var definition = ramlReader.read(args);
                    $scope.baseUri = ramlReader.processBaseUri(args);
                    $scope.resources = definition.resources;
                    $scope.documentation = args.documentation;
                    $scope.$apply();
                });
            }
        };
    });
