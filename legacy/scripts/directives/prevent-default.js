'use strict';

angular.module('ramlConsoleApp')
    .directive('preventDefault', function () {
        return function (scope, element) {
            var preventDefaultHandler = function (event) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
            };
            element[0].addEventListener('click', preventDefaultHandler, false);
        };
    });