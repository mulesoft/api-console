function compileTemplate(template, scope) {
  var compiled;
  inject(function($compile) {
    compiled = $compile(template)(scope);
    scope.$digest();
  });

  return $(compiled);
}
