(function() {
  'use strict';

  RAML.Directives.markdown = function() {
    var converter = new Showdown.converter();

    var link = function($scope, $element, $attrs) {
      $element.html(converter.makeHtml($scope.markdown));
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
