describe("trying an API method", function() {
  fakeApiEndpoint("resource", "Hello World!");

  var definition = createRAML(
    "title: Example API",
    "baseUri: http://localhost:9001",
    "/resource:",
    "  get:"
  );

  var openResource = function(index) {
    var selector = protractor.By.css('[role="resource"]:nth-child(' + index + ')');
    var resource = ptor.findElement(selector);
    resource.findElement(protractor.By.css('.accordion-toggle')).click();

    return resource;
  };

  var openTryIt = function(resource) {
    var tryItTab = resource.findElement(protractor.By.css('[role="methodSummary"] button[role="try-it-tab"]'));
    tryItTab.click();
  };

  var tryIt = function(resource) {
    var tryItButton = resource.findElement(protractor.By.css('button[role="try-it"]'));
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

      var responseStatus = resource.findElement(protractor.By.css('.try-it .response .status'));
      expect(responseStatus.getText()).toMatch(/200/);

      var responseHeaders = resource.findElement(protractor.By.css('.try-it .response .headers'));
      expect(responseHeaders.getText()).toMatch(/content-length: \d+/i);

      var responseBody = resource.findElement(protractor.By.css('.try-it .response .body'));
      expect(responseBody.getText()).toMatch(/Hello World!/);
    });
  });
});
