describe("RAML.Directives.documentation", function() {
  beforeEach(module('ramlConsoleApp'));

  var scope, $el;

  function createScopeWithXMLRequestBody(xmlProperties) {
    return createScope(function(scope) {
      scope.resource = {};
      scope.method = {
        body: {
          "text/xml": xmlProperties
        }
      };
    });
  };

  describe('given a method and resource with no documentation', function() {
    beforeEach( function() {
      scope = createScope(function(scope) {
        scope.resource = scope.method = {};
      });
      $el = compileTemplate("<documentation></documentation>", scope);
    });

    it('disables the parameters tab', function() {
      expect($el.find("[role='documentation-parameters']")).toHaveClass('disabled');
    });

    it('disables the requests tab', function() {
      expect($el.find("[role='documentation-requests']")).toHaveClass('disabled');
    });

    it('disables the responses tab', function() {
      expect($el.find("[role='documentation-responses']")).toHaveClass('disabled');
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

    it('enables the parameters tab', function() {
      expect($el.find("[role='documentation-parameters']")).not.toHaveClass('disabled');
    });
  });

  describe('given a method with only an XML request body schema', function() {
    beforeEach( function() {
      scope = createScopeWithXMLRequestBody({ schema: "superschema" });
      $el = compileTemplate("<documentation></documentation>", scope);
    });

    it('enables the requests tab', function() {
      expect($el.find("[role='documentation-requests']")).not.toHaveClass('disabled');
    });

    it('displays the schema', function() {
      expect($el.find("[role='documentation-requests']").text()).toMatch('superschema');
    });

    it('does not display the example request section', function() {
      expect($el.find("[role='documentation-requests']").text()).not.toMatch('Example Request');
    });
  });

  describe('given a method with only an XML request body example', function() {
    beforeEach( function() {
      scope = createScopeWithXMLRequestBody({ example: "someexample" });
      $el = compileTemplate("<documentation></documentation>", scope);
    });

    it('enables the requests tab', function() {
      expect($el.find("[role='documentation-requests']")).not.toHaveClass('disabled');
    });

    it('displays the example', function() {
      expect($el.find("[role='documentation-requests']").text()).toMatch('someexample');
    });

    it('does not display the example schema section', function() {
      expect($el.find("[role='documentation-requests']").text()).not.toMatch('Example Schema');
    });
  });

  describe('given a method with response documentation', function() {
    beforeEach( function() {
      scope = createScope(function(scope) {
        scope.resource = {};
        scope.method = {
          responses: {
            200: { description: 'A-Okay' },
            500: { description: 'Ut Oh'}
          }
        };
      });
      $el = compileTemplate("<documentation></documentation>", scope);
    });

    it('enables the responses tab', function() {
      expect($el.find("[role='documentation-responses']")).not.toHaveClass('disabled');
    });

    it('displays both responses', function() {
      expect($el.find("[role='documentation-responses'] h4").length).toEqual(2);
    });
  });
});
