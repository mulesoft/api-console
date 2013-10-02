describe("RAML.Directives.codeMirror", function() {
  beforeEach(function() {
    spyOn(window, 'CodeMirror');
    this.link = new RAML.Directives.codeMirror().link;
  });

  describe("upon linking", function() {
    var scope, elementMock;

    beforeEach(function() {
      scope = jasmine.createSpyObj('scope', ['$watch']);
      elementMock = ['value 1'];
    });

    it("calls CodeMirror on the element", function() {
      scope.code = 'my codez';

      this.link(scope, elementMock, undefined);

      expect(CodeMirror).toHaveBeenCalledWith(elementMock[0], jasmine.any(Object));
      expect(window.CodeMirror.mostRecentCall.args[1].value).toEqual('my codez');
    });

    describe("with no initial code", function() {
      it("defaults to an empty string", function() {
        this.link(scope, elementMock, undefined);

        expect(window.CodeMirror.mostRecentCall.args[1].value).toEqual('');

      });
    });
  });
});
