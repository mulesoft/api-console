'use strict';

angular.module('helpers')
    .factory('showdown', function () {
        var Showdown = window.Showdown;
        var showdown = new Showdown.converter();

        return showdown;
    });