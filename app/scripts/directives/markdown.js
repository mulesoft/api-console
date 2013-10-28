(function() {
  'use strict';

  RAML.Directives.markdown = function($sanitize, $parse) {
    var converter = new Showdown.converter();

    var link = function(scope, element, attrs) {
      var markdown = $parse(attrs.markdown)(scope);

      var result = converter.makeHtml(markdown || '');

      element.html($sanitize(result));
    };

    return {
      restrict: 'A',
      link: link
    };
  };
})();
