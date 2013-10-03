describe("RAML.Directives.documentation", function() {
  beforeEach(module('ramlConsoleApp'));

  var scope, $el;

  function createScopeForTextXML(xmlProperties) {
    return createScope(function(scope) {
      scope.resource = {};
      scope.method = {
        body: {
          "text/xml": xmlProperties
        }
      };
    });
  };

  describe('given a method and resource with no query or uri parameters', function() {
    beforeEach( function() {
      scope = createScope(function(scope) {
        scope.resource = scope.method = {};
      });
      $el = compileTemplate("<documentation></documentation>", scope);
    });

    it('disables the parameters tab', function() {
      expect($el.find("[role='documentation-parameters']")).toHaveClass('disabled');
    });
  });

  describe('given a method with query parameters', function() {
    beforeEach( function() {
      scope = createScope(function(scope) {
        scope.resource = {};
        scope.method = {
          queryParameters: {
            page: {}
          }
        };
      });
      $el = compileTemplate("<documentation></documentation>", scope);
    });

    it('does not disable the parameters tab', function() {
      expect($el.find("[role='documentation-parameters']")).not.toHaveClass('disabled');
    });
  });

  describe('given a method with an XML request body schema', function() {
    beforeEach( function() {
      scope = createScopeForTextXML({ schema: "superschema"});
      $el = compileTemplate("<documentation></documentation>", scope);
    });

    it('displays the schema', function() {
      expect($el.find("[role='documentation-requests']").text()).toMatch('superschema');
    });

    it('does not display the example request section', function() {
      expect($el.find("[role='documentation-requests']").text()).not.toMatch('Example Request');
    });
  });

  describe('given a method with an XML request body example', function() {
    beforeEach( function() {
      scope = createScopeForTextXML({ example: "someexample"});
      $el = compileTemplate("<documentation></documentation>", scope);
    });

    it('displays the example', function() {
      expect($el.find("[role='documentation-requests']").text()).toMatch('someexample');
    });

    it('does not display the example schema section', function() {
      expect($el.find("[role='documentation-requests']").text()).not.toMatch('Example Schema');
    });
  });

  describe('given a method with no XML body documentation', function() {
    beforeEach( function() {
      scope = createScope();
      scope.method = scope.resource = {};
      $el = compileTemplate("<documentation></documentation>", scope);
    });

    it('disables the requests tab', function() {
      expect($el.find("[role='documentation-requests']")).toHaveClass('disabled');
    });
  });

});
