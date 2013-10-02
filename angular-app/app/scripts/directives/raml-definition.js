'use strict';

angular.module('ramlConsoleApp')
    .directive('ramlDefinition', function ($rootScope) {
        return {
            restrict: 'E',
            templateUrl: 'views/raml-definition.tmpl.html',
            replace: true,
            transclude: false,
            scope: {
                'id': '@',
                'src': '@'
            },
            controller: function ($scope, $element, $attrs, ramlParser) {
                ramlParser.loadFile($attrs.src)
                    .done(function (result) {
                        $rootScope.$emit('event:raml-parsed', result);
                    });
            }
        };
    });
