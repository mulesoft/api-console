(function() {
  'use strict';

  RAML.Directives.parameterTable = function() {

    var link = function($scope, $element, $attrs) {
    }

    return {
      restrict: 'E',
      link: link,
      templateUrl: 'views/parameter_table.tmpl.html',
      replace: true,
      scope: {
        heading: '@',
        parameters: '='
      }
    }
  }
})();
