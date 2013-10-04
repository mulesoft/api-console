describe("RAML.Directives.documentation", function() {
  beforeEach(module('ramlConsoleApp'));

  var scope, $el, section;

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
      section = $el.find("[role='documentation-parameters']");
    });

    it('enables the parameters tab', function() {
      expect(section).not.toHaveClass('disabled');
    });
  });

  describe('given a method with only an XML request body schema', function() {
    beforeEach( function() {
      scope = createScopeWithXMLRequestBody({ schema: "superschema" });
      $el = compileTemplate("<documentation></documentation>", scope);
      section = $el.find("[role='documentation-requests']");
    });

    it('enables the requests tab', function() {
      expect(section).not.toHaveClass('disabled');
    });

    it('displays the schema', function() {
      expect(section.text()).toMatch('superschema');
    });

    it('does not display the example request section', function() {
      expect(section.text()).not.toMatch('Example Request');
    });
  });

  describe('given a method with only an XML request body example', function() {
    beforeEach( function() {
      scope = createScopeWithXMLRequestBody({ example: "someexample" });
      $el = compileTemplate("<documentation></documentation>", scope);
      section = $el.find("[role='documentation-requests']");
    });

    it('enables the requests tab', function() {
      expect(section).not.toHaveClass('disabled');
    });

    it('displays the example', function() {
      expect(section.text()).toMatch('someexample');
    });

    it('does not display the example schema section', function() {
      expect(section.text()).not.toMatch('Example Schema');
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
      setFixtures($el);

      section = $("[role='documentation-responses']");
    });

    it('enables the responses tab', function() {
      expect(section).not.toHaveClass('disabled');
    });

    it('shows the description of both responses', function() {
      expect(section.find("h3").eq(0).text().trim()).toEqual("200");
      expect(section.find("h3").eq(1).text().trim()).toEqual("500");
      expect(section.find("[role='response']").eq(0).text().trim()).toEqual("A-Okay");
      expect(section.find("[role='response']").eq(1).text().trim()).toEqual("Ut Oh");
    });

    it('makes both responses visible', function() {
      var responses = section.find("[role='response']");

      expect(responses.eq(0)).toBeVisible();
      expect(responses.eq(1)).toBeVisible();
    });

    it('hides a response on click', function() {
      var header = $("[role='documentation-responses'] a").first();
      header.click();

      var response = $el.find("[role='response']")

      expect(response.first()).not.toBeVisible();
      expect(response.last()).toBeVisible();
    });

  });
});
