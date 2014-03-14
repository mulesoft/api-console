describe("RAML.Directives.codeMirror", function() {
  var scope, $el;

  beforeEach(module('ramlConsoleApp'));

  describe('linking the code-mirror directive', function() {
    beforeEach(function() {
      scope = createScope(function(scope) {
        scope.visible = false;
        scope.mode = 'text/xml';
      });
      $el = compileTemplate('<div code-mirror="code" mode="{{mode}}" visible="visible"></div>', scope);
    });

    describe('updating the code mirror content', function() {
      beforeEach(function() {
        expect($el.text().trim()).toEqual('');
        scope.code = "DaVinci code";
        scope.visible = true;
        scope.$digest();
      });

      it('refreshes code mirror when visible evaluates to true', function() {
        expect($el.text()).toMatch(/DaVinci code[\d\s]*/);
      });

      it('refreshes code mirror when the code changes', function() {
        scope.code = "Something Else";
        scope.$digest();
        expect($el.text()).toMatch(/Something Else[\d\s]*/);
      });
    });
  });
});
