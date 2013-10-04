describe("RAML.Directives.codeMirror", function() {
  var editor, link;

  beforeEach(function() {
    editor = jasmine.createSpyObj('editor', ['setSize', 'lineCount', 'operation']);
    spyOn(window, 'CodeMirror').andReturn(editor);

    link = new RAML.Directives.codeMirror().link;
  });

  describe("upon linking", function() {
    var scope, elementMock;

    beforeEach(function() {
      scope = jasmine.createSpyObj('scope', ['$watch']);
      elementMock = ['value 1'];
    });

    it("calls CodeMirror on the element", function() {
      scope.code = 'my codez';

      link(scope, elementMock, undefined);

      expect(CodeMirror).toHaveBeenCalledWith(elementMock[0], jasmine.any(Object));
      expect(window.CodeMirror.mostRecentCall.args[1].value).toEqual('my codez');
    });

    describe("with no initial code", function() {
      it("defaults to an empty string", function() {
        link(scope, elementMock, undefined);
        expect(window.CodeMirror.mostRecentCall.args[1].value).toEqual('');
      });
    });
  });
});
