describe("RAML.Directives.codeMirror", function() {
  var scope, $el;

  beforeEach(module('ramlConsoleApp'));

  describe('linking the code-mirror directive', function() {
    beforeEach(function() {
      scope = createScope(function(scope) {
        scope.mode = 'text/xml';
      });
      $el = compileTemplate('<div code-mirror="code" mode="{{mode}}" visible="code"></div>', scope);
    });

    describe('watching the visible attribute', function() {
      it('refreshes code mirror when visible evaluates to true', function() {
        expect($el.text()).toMatch(/^\s*$/);
        scope.code = "DaVinci code";
        scope.$digest();
        expect($el.text()).toMatch(/DaVinci code[\d\s]*/);
      });
    });
  });
});
