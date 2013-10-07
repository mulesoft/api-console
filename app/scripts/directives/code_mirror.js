(function() {
  'use strict';

  // https://groups.google.com/forum/#!topic/codemirror/oGeWPzZynxo
  function indentAll(cm) {
    var last = cm.lineCount();
    cm.operation(function() {
      for (var i = 0; i < last; ++i) cm.indentLine(i);
    });
  };

  var link = function(scope, element, attrs) {
    scope.mode = scope.mode || 'text/xml';
    scope.code = scope.code || '';

    var editor = CodeMirror(element[0], {
      mode: scope.mode,
      readOnly: "nocursor",
      value: scope.code || '',
      lineNumbers: true,
      indentUnit: 4
    });

    editor.setSize("100%", "100%");

    scope.$watch('visible', function(visible) {
      if (visible) {
        editor.setValue(scope.code);
        editor.setOption("mode", scope.mode);
        indentAll(editor);
        editor.refresh();
      }
    });
  };

  RAML.Directives.codeMirror = function() {
    return {
      link: link,
      restrict: 'A',
      replace: true,
      scope: {
        code: "=codeMirror",
        visible: "=",
        mode: "=?"
      }
    }
  }
})();
