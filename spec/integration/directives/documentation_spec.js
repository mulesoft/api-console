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

  function createScopeWithFirstResourceAndMethod(parsedApi) {
    scope = createScope(function(scope) {
      scope.api = RAML.Inspector.create(parsedApi);
      scope.resource = scope.api.resources[0];
      scope.method = scope.resource.methods[0];
      scope.method.pathBuilder = new RAML.Inspector.PathBuilder.create(scope.resource.pathSegments);
    });
    return scope;
  };

  function compileWithScopeFromFirstResourceAndMethodOfRAML(directive, raml, callback) {
    var parsed = {},
        completed = false;

    runs(function() {
      var success = function(result) {
        for (var property in result) {
          parsed[property] = result[property];
        }
        completed = true;
      }

      var error = function() {
        console.log("could not parse: " + raml);
        completed = true;
      }

      RAML.Parser.load(raml).then(success, error);
    });

    waitsFor(function() { return completed; }, "RAML parse took too long", 5000);

    runs(function() {
      $el = compileTemplate(directive, createScopeWithFirstResourceAndMethod(parsed));
      if (callback) {
        callback($el);
      }
    });
  };

  describe('given a method and resource with no documentation', function() {
    beforeEach(function() {
      var raml = createRAML(
        'title: Example API',
        'baseUri: http://www.example.com',
        '/resource:',
        '  get:'
      );

      compileWithScopeFromFirstResourceAndMethodOfRAML(
        "<documentation></documentation>", raml
      );
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
    beforeEach(function() {
      var raml = createRAML(
        'title: Example API',
        'baseUri: http://www.example.com',
        '/resource:',
        '  get:',
        '    queryParameters:',
        '      page:'
      );

      compileWithScopeFromFirstResourceAndMethodOfRAML(
        "<documentation></documentation>", raml, function($el) {
          section = $el.find("[role='documentation-parameters']");
        }
      );
    });

    it('enables the parameters tab', function() {
      expect(section).not.toHaveClass('disabled');
    });
  });

  describe('given a method with only an XML request body schema', function() {
    beforeEach(function() {
      var raml = createRAML(
        'title: Example API',
        'baseUri: http://www.example.com',
        '/resource:',
        '  get:',
        '    body:',
        '      text/xml:',
        '        schema: superschema'
      );

      compileWithScopeFromFirstResourceAndMethodOfRAML(
        "<documentation></documentation>", raml, function($el) {
          section = $el.find("[role='documentation-requests']");
        }
      );
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
    beforeEach(function() {
      var raml = createRAML(
        'title: Example API',
        'baseUri: http://www.example.com',
        '/resource:',
        '  get:',
        '    body:',
        '      text/xml:',
        '        example: someexample'
      );

      compileWithScopeFromFirstResourceAndMethodOfRAML(
        "<documentation></documentation>", raml, function($el) {
          section = $el.find("[role='documentation-requests']");
        }
      );
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
    beforeEach(function() {
      var raml = createRAML(
        'title: Example API',
        'baseUri: http://www.example.com',
        '/resource:',
        '  get:',
        '    responses:',
        '      200:',
        '        description: A-Okay',
        '      500:',
        '        description: Ut Oh'
      );

      compileWithScopeFromFirstResourceAndMethodOfRAML(
        "<documentation></documentation>", raml, function($el) {
          setFixtures($el);
          section = $("[role='documentation-responses']");
        }
      );
    });

    it('enables the responses tab', function() {
      expect(section).not.toHaveClass('disabled');
    });

    it('shows the description of both responses', function() {
      expect(section.find("h4").eq(0).text().trim()).toEqual("200");
      expect(section.find("h4").eq(1).text().trim()).toEqual("500");
      expect(section.find("[role='response']").eq(0).text().trim()).toEqual("A-Okay");
      expect(section.find("[role='response']").eq(1).text().trim()).toEqual("Ut Oh");
    });

    it('makes both responses visible', function() {
      var responses = section.find("[role='response']");

      expect(responses.eq(0)).toBeVisible();
      expect(responses.eq(1)).toBeVisible();
    });

    it('hides a response on click', function() {
      var header = $("[role='documentation-responses'] h4").first();
      header.click();

      var response = $el.find("[role='response']")

      expect(response.first()).not.toBeVisible();
      expect(response.last()).toBeVisible();
    });

  });
});
