(function() {
  'use strict';

  RAML.Directives.markdown = function($sanitize) {
    var converter = new Showdown.converter({ extensions: ['table'] });

    var link = function(scope, element) {
      var processMarkdown = function(markdown) {
        var result = converter.makeHtml(markdown || '');
        element.html($sanitize(result));
      };

      scope.$watch('markdown', processMarkdown);
    };

    return {
      restrict: 'A',
      link: link,
      scope: {
        markdown: '='
      }
    };
  };
})();
