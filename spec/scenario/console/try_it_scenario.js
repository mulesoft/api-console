describe("trying an API method", function() {
  var BASE_URI = 'http://localhost:9001';
  fakeApiEndpoint("resource", "Hello World!");

  var disableProxy = function() {
    beforeEach(function() {
      ptor.driver.executeScript("RAML.Settings.proxy = '';");
    });
  }

  var definition = createRAML(
    "title: Example API",
    "baseUri: " + BASE_URI,
    "/resource:",
    "  get:"
  );

  var openTryIt = function(resource) {
    var method = openMethod(1, resource);
    method.$('.method-nav-group li:last-child a').click();

    return ptor.$('.resource-popover');
  };

  var tryIt = function(resource) {
    var tryItButton = resource.$('button[role="try-it"]');
    tryItButton.click();
  };

  describe("with no parameters", function() {
    var definition = createRAML(
      "title: Example API",
      "baseUri: " + BASE_URI,
      "/resource:",
      "  get:"
    );

    var fixturePath = loadRamlFixture(definition);
    disableProxy();

    it("executes the request and displays the results", function() {
      var resource = toggleResource(1);
      resource = openTryIt(resource);
      tryIt(resource);

      var requestUrl = resource.$('.try-it .response .request-url');
      expect(requestUrl.getText()).toMatch(new RegExp(BASE_URI + "/resource"));

      var responseStatus = resource.$('.try-it .response .status');
      ptor.executeScript(function() {
        document.querySelector('.try-it .response').scrollIntoView();
      });
      expect(responseStatus.getText()).toMatch(/200/);

      var responseHeaders = resource.$('.try-it .response .headers');
      expect(responseHeaders.getText()).toMatch(/content-length: \d+/i);

      var responseBody = resource.$('.try-it .response .body');
      expect(responseBody.getText()).toMatch(/Hello World!/);
    });
  });

  describe("with a missing required uri parameter", function() {
    var definition = createRAML(
      "title: Example API",
      "baseUri: " + BASE_URI,
      "/resource/{id}:",
      "  get:"
    );

    var fixturePath = loadRamlFixture(definition);
    disableProxy();

    it("does not execute the request", function() {
      var resource = toggleResource(1);
      resource = openTryIt(resource);
      tryIt(resource);

      expect(resource.$('.try-it [role="error"]').getText()).toMatch(/Required URI Parameters must be entered/);
    });
  });

  describe("with a missing required query parameter", function() {
    var definition = createRAML(
      "title: Example API",
      "baseUri: " + BASE_URI,
      "/things:",
      "  get:",
      "    queryParameters:",
      "      page:",
      "        required: true"
    );

    var fixturePath = loadRamlFixture(definition);
    disableProxy();

    it("does execute the request", function() {
      var resource = toggleResource(1);
      resource = openTryIt(resource);
      tryIt(resource);

      var queryParameterInput = resource.$('input[name="page"]');
      expect(queryParameterInput.getAttribute('class')).toContain('warning');
    });
  });

  describe('with a JSON schema', function() {
    var definition = createRAML(
      'title: Example API',
      'baseUri: ' + BASE_URI,
      '/things:',
      '  post:',
      '    body:',
      '      application/json:',
      '        schema: |',
      '          {',
      '            "type": "object",',
      '            "properties": {',
      '              "name": { "type": "string" },',
      '              "role": { "type": "string", "default": "user" },',
      '              "age": { "type": "integer" }',
      '            }',
      '          }'
    );
    var fixturePath = loadRamlFixture(definition);
    disableProxy();

    it('should enable schema based template generation', function() {
      var resource = toggleResource(1);
      resource = openTryIt(resource);

      // there is only one visible prefill option as we did not specify an
      // example. For this reason this simple selector is sufficient and
      // stable.
      var prefillButton = resource.$('a.body-prefill:not(.ng-hide)');
      prefillButton.click();

      var output = resource.$('.item-content textarea');
      // deliberately _not_ creating a JS Object and stringifying it
      // via JSON.stringify() as this might lead to unstable results due to
      // an unspecified iteration order
      var expected = [
        '{',
        '  "name": "TODO",',
        '  "role": "user",',
        '  "age": 0',
        '}'
      ].join('\n');
      expect(output.getAttribute('value')).toEqual(expected);
    });
  });

  describe('with an XML schema', function() {
    var definition = createRAML(
      'title: Example API',
      'baseUri: ' + BASE_URI,
      '/things:',
      '  post:',
      '    body:',
      '      application/xml:',
      '        schema: |',
      '          <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">',
      '            <xs:element type="xs:int" name="id"/>',
      '          </xs:schema>'
    );
    var fixturePath = loadRamlFixture(definition);
    disableProxy();

    it('should not offer prefill options', function() {
      var resource = toggleResource(1);
      resource = openTryIt(resource);

      var prefillButtons = resource.$$('a.body-prefill');
      prefillButtons.then(function(buttons) {
        buttons.forEach(function(button) {
          expect(button.getCssValue('display')).toBe('none');
        });
      });
    });
  });

});
