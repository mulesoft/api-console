(function() {
  'use strict';

  var link = function(scope, element, attrs) {
    var editor = CodeMirror(element[0], {
      mode: "text/xml",
      readOnly: "nocursor",
      value: scope.code || '',
      lineNumbers: true
    });

    editor.setSize("100%", "100%");

    scope.$watch('visible', function(visible) {
      if (visible)
        editor.refresh();
    });
  };

  RAML.Directives.codeMirror = function() {
    return {
      link: link,
      restrict: 'A',
      replace: true,
      scope: {
        code: "=codeMirror",
        visible: "="
      }
    }
  }
})();
