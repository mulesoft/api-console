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
});
