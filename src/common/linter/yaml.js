(function() {
  'use strict';

  window.ramlErrors = [];

  CodeMirror.registerHelper('lint', 'yaml', function () {
    var found = [];

    window.ramlErrors.forEach(function (ramlError) {
      found.push({
        message: ramlError.message,
        severity: 'error',
        from: CodeMirror.Pos(ramlError.line),
        to: CodeMirror.Pos(ramlError.line)
      });

    });

    return found;
  });
})();
