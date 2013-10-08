describe("RAML.Directives.codeMirror.Controller", function() {
  var controller, editor;

  function createElementMock() {
    return [{}];
  }

  function createScopeMock(mode, code) {
    return {
      mode: mode,
      code: code
    }
  }

  beforeEach(function() {
    editor = jasmine.createSpyObj('editor', ['setSize', 'lineCount', 'operation']);
    spyOn(window, 'CodeMirror').andReturn(editor);
  });

  describe("creating a new instance", function() {
    var scope, elementMock;

    describe("by default", function() {
      beforeEach(function() {
        scope = createScopeMock();
        elementMock = createElementMock();
        controller = new RAML.Directives.codeMirror.Controller(scope, elementMock)
      });

      it("calls CodeMirror on the element", function() {
        expect(CodeMirror).toHaveBeenCalledWith(elementMock[0], jasmine.any(Object));
      });

      it("passes an empty value to CodeMirror", function() {
        expect(CodeMirror.mostRecentCall.args[1].value).toEqual('');
      });
    });

    describe("with given code", function() {
      beforeEach(function() {
        scope = createScopeMock(undefined, 'my codez');
        elementMock = createElementMock();
        controller = new RAML.Directives.codeMirror.Controller(scope, elementMock)
      });

      it("passes scope.code as value to CodeMirror", function() {
        expect(CodeMirror.mostRecentCall.args[1].value).toEqual('my codez');
      });
    });

    describe("with given mode", function() {
      beforeEach(function() {
        scope = createScopeMock('application/json');
        elementMock = createElementMock();
        controller = new RAML.Directives.codeMirror.Controller(scope, elementMock)
      });

      it("passes scope.mode as mode to CodeMirror", function() {
        expect(CodeMirror.mostRecentCall.args[1].mode).toEqual('application/json');
      });
    });
  });

  describe("in 'application/json' mode", function() {
    describe('with valid JSON', function() {
      beforeEach(function() {
        scope = createScopeMock('application/json', '{"very": "dense"}');
        elementMock = createElementMock();
        controller = new RAML.Directives.codeMirror.Controller(scope, elementMock)
      });

      it("prettifies dense JSON", function() {
        expect(CodeMirror.mostRecentCall.args[1].value).toEqual('{\n    "very": "dense"\n}');
      });
    });

    describe('with invalid JSON', function() {
      beforeEach(function() {
        scope = createScopeMock('application/json', 'BAD JSON STRING');
        elementMock = createElementMock();
        controller = new RAML.Directives.codeMirror.Controller(scope, elementMock)
      });

      it("leaves the JSON untouched", function() {
        expect(CodeMirror.mostRecentCall.args[1].value).toEqual('BAD JSON STRING');
      });

    });
  });
});
