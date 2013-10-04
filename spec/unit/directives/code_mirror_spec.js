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
      link(scope, elementMock, undefined);

      expect(CodeMirror).toHaveBeenCalledWith(elementMock[0], jasmine.any(Object));
    });


    it("defaults to an empty string for value", function() {
      link(scope, elementMock, undefined);

      expect(CodeMirror.mostRecentCall.args[1].value).toEqual('');
    });

    it("defaults to 'text/xml' for mode", function() {
      link(scope, elementMock, undefined);

      expect(CodeMirror.mostRecentCall.args[1].mode).toEqual('text/xml');
    });

    it("passes scope.code as value to CodeMirror", function() {
      scope.code = 'my codez';
      link(scope, elementMock, undefined);

      expect(CodeMirror.mostRecentCall.args[1].value).toEqual('my codez');
    });

    it("passes scope.mode as mode to CodeMirror", function() {
      scope.mode = 'application/json';
      link(scope, elementMock, undefined);

      expect(CodeMirror.mostRecentCall.args[1].mode).toEqual('application/json');
    });

  });
});
