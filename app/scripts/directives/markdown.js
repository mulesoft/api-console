(function() {
  'use strict';

  RAML.Directives.markdown = function($sanitize) {
    var converter = new Showdown.converter();

    var link = function($scope, $element, $attrs) {
      var result = converter.makeHtml($scope.markdown);

      $element.html($sanitize(result));
    };

    return {
      restrict: 'A',
      link: link,
      scope: {
        markdown: '='
      }
    }
  };
})();
