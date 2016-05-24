(function () {
  'use strict';

  angular.module('RAML.Directives')
    .directive('ramlConsoleSpinner', function ramlConsoleSpinner() {
      return {
        restrict:    'E',
        templateUrl: 'directives/raml-console-spinner.tpl.html',
        replace:     true
      };
    })
  ;
})();
