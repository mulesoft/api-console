'use strict';

angular.module('ramlConsoleApp')
    .filter('formatUriPart', function () {
        return function (text) {
            return text.replace('\\', '');
        };
    });