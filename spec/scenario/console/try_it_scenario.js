describe("trying an API method", function() {
  var BASE_URI = 'http://localhost:9001';
  fakeApiEndpoint("resource", "Hello World!");

  var definition = createRAML(
    "title: Example API",
    "baseUri: " + BASE_URI,
    "/resource:",
    "  get:"
  );

  var openTryIt = function(resource) {
    resource.$('[role="methodSummary"]').click();
    resource.$('[role="method"] .nav-tabs li:last-child a').click();
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

    it("executes the request and displays the results", function() {
      var resource = openResource(1);
      openTryIt(resource);
      tryIt(resource);

      var requestUrl = resource.$('.try-it .response .request-url');
      expect(requestUrl.getText()).toMatch(new RegExp(BASE_URI + "/resource"));

      var responseStatus = resource.$('.try-it .response .status');
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

    it("does not execute the request", function() {
      var resource = openResource(1);
      openTryIt(resource);
      tryIt(resource);

      waitUntilTextEquals(
        resource.$('.try-it [role="error"]'),
        "Required URI Parameters must be entered"
      );

      var uriParemeterInput = resource.$('[role=path] input');
      expect(uriParemeterInput.getAttribute('class')).toContain('error');
    });
  });

  describe("with a missing required query parameter", function() {
    var definition = createRAML(
      "title: Example API",
      "baseUri: " + BASE_URI,
      "/things",
      "  get:",
      "    queryParameters:",
      "      page:",
      "        required: true"
    );

    var fixturePath = loadRamlFixture(definition);

    it("does execute the request", function() {
      var resource = openResource(1);
      openTryIt(resource);
      tryIt(resource);

      var queryParameterInput = resource.$('input');
      expect(queryParameterInput.getAttribute('class')).toContain('warning');
    });
  });
});
