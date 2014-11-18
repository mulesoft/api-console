(function() {
  'use strict';

  window.ramlErrors = {};

  CodeMirror.registerHelper('lint', 'yaml', function () {
    var found = [];

    found.push({
      message: window.ramlErrors.message,
      severity: 'error',
      from: CodeMirror.Pos(window.ramlErrors.line),
      to: CodeMirror.Pos(window.ramlErrors.line)
    });

    return found;
  });
})();
