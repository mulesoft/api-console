describe("trying an API method", function() {
  fakeApiEndpoint("resource", "Hello World!");

  var definition = createRAML(
    "title: Example API",
    "baseUri: http://localhost:9001",
    "/resource:",
    "  get:"
  );

  var openTryIt = function(resource) {
    var tryItTab = resource.$('[role="methodSummary"] button[role="try-it-tab"]');
    tryItTab.click();
  };

  var tryIt = function(resource) {
    var tryItButton = resource.$('button[role="try-it"]');
    tryItButton.click();
  };

  describe("with no parameters", function() {
    var definition = createRAML(
      "title: Example API",
      "baseUri: http://localhost:9001",
      "/resource:",
      "  get:"
    );

    var fixturePath = loadRamlFixture(definition);

    it("executes the request and displays the results", function() {
      var resource = openResource(1);
      openTryIt(resource);
      tryIt(resource);

      var requestUrl = resource.$('.try-it .response .request-url');
      expect(requestUrl.getText()).toMatch(/http:\/\/localhost:9001\/resource/);

      var responseStatus = resource.$('.try-it .response .status');
      expect(responseStatus.getText()).toMatch(/200/);

      var responseHeaders = resource.$('.try-it .response .headers');
      expect(responseHeaders.getText()).toMatch(/content-length: \d+/i);

      var responseBody = resource.$('.try-it .response .body');
      expect(responseBody.getText()).toMatch(/Hello World!/);
    });
  });
});
