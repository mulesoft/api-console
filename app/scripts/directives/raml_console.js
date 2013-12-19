(function() {
  'use strict';

  RAML.Directives.ramlConsole = function(ramlParserWrapper, DataStore) {

    var link = function ($scope, $el, $attrs, controller) {
      ramlParserWrapper.onParseSuccess(function(raml) {
        $scope.api = controller.api = RAML.Inspector.create(raml);
        DataStore.invalidate();
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
