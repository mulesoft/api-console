function compileTemplate(tempalte, scope) {
  var compiled;
  inject(function($compile) {
    compiled = $compile(tempalte)(scope);
    scope.$digest();
  });

  return $(compiled);
}
