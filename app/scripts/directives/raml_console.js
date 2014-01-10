(function() {
  'use strict';

  RAML.Directives.ramlConsole = function(ramlParserWrapper, DataStore, $timeout) {

    var link = function ($scope, $el, $attrs, controller) {
      ramlParserWrapper.onParseSuccess(function(raml) {
        var inner = $($el[0]).find('.inner');

        if (inner.length) {
          var height = inner[0].scrollHeight;
          inner.css('height', height);
        }
        $scope.api = controller.api = RAML.Inspector.create(raml);
        $timeout(function() {
          inner.css('height', 'auto');
        }, 0);
      });

      ramlParserWrapper.onParseError(function(error) {
        $scope.parseError = error;
      });
    };

    return {
      restrict: 'E',
      templateUrl: 'views/raml-console.tmpl.html',
      controller: RAML.Controllers.RAMLConsole,
      scope: {
        src: '@'
      },
      link: link
    };
  };
})();
