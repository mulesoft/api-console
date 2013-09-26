describe("trying an API method", function() {
  fakeApiEndpoint("resource", "Hello World!");

  var definition = createRAML([
    "title: Example API",
    "baseUri: http://localhost:9001",
    "/resource:",
    "  get:"
  ]);

  var fixturePath = fixturizeRaml(definition);

  describe("with no parameters", function() {
    beforeEach(function() {
      ptor = protractor.getInstance();

      ptor.get('http://localhost:9001');
      ptor.findElement(protractor.By.css("input[type=text]")).sendKeys(fixturePath);
      ptor.findElement(protractor.By.css("input[type=submit]")).click();
    });

    it("executes the request and displays the results", function() {
      var resource = ptor.findElement(protractor.By.css('[role="resource"]'));
      resource.findElement(protractor.By.css('.accordion-toggle')).click();

      var tryItTab = resource.findElement(protractor.By.css('[role="methodSummary"] button[role="try-it-tab"]'));
      tryItTab.click();

      var tryItButton = resource.findElement(protractor.By.css('button[role="try-it"]'));
      tryItButton.click();

      var responseStatus = resource.findElement(protractor.By.css('.try-it .response .status'));
      expect(responseStatus.getText()).toMatch(/200/);

      var responseHeaders = resource.findElement(protractor.By.css('.try-it .response .headers'));
      expect(responseHeaders.getText()).toMatch(/content-length: \d+/i);

      var responseBody = resource.findElement(protractor.By.css('.try-it .response .body'));
      expect(responseBody.getText()).toMatch(/Hello World!/);
    });
  })
});
