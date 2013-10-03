describe('accordion view of API', function() {
  var ptor = protractor.getInstance();

  var getResources = function() {
    return ptor.findElements(protractor.By.css('[role="api-console"] [role="resource"]'));
  }

  describe('top-level view', function() {
    raml = [
      "#%RAML 0.2",
      "---",
      "title: Example API",
      "baseUri: #{test_api_uri}",
      "traits:",
      "  - secured:",
      "      description: Some requests require authentication",
      "resourceTypes:",
      "  - collection:",
      "      description: bunk",
      "/resource:",
      "  get: !!null",
      "  /{resourceId}:",
      "    get: !!null",
      "    post: !!null",
      "/another/resource:",
      "  type: collection",
      "  is: [secured]",
      "  get: !!null"].join('\n');

    loadRamlFixture(raml);

    it('renders an overview of each API resource', function() {
      var body = ptor.findElement(protractor.By.css("body"));
      expect(body.getText()).toMatch(/Example API/);

      getResources().then(function(resources) {
        expect(resources).toHaveLength(3);
        var methodSummarySelector = protractor.By.css('[role="resourceSummary"] [role="methods"] li');
        var methodsPromise = resources[0].findElements(methodSummarySelector);
        expect(methodsPromise).toHaveLength(1);

        methodsPromise = resources[1].findElements(methodSummarySelector);
        expect(methodsPromise).toHaveLength(2);
        methodsPromise.then(function(methods) {
          expect(methods[0].getText()).toMatch(/^get$/i);
          expect(methods[1].getText()).toMatch(/^post$/i);
        });

        methodsPromise = resources[2].findElements(methodSummarySelector);
        expect(methodsPromise).toHaveLength(1);

        var traitsPromise = resources[2].findElements(protractor.By.css('[role="traits"] li'))
        expect(traitsPromise).toHaveLength(1);
        traitsPromise.then(function(traits) {
          expect(traits[0].getText()).toEqual('secured');
        });

        var resourceTypesPromise = resources[2].findElements(protractor.By.css('[role="resourceType"]'))
        expect(resourceTypesPromise).toHaveLength(1);
        resourceTypesPromise.then(function(resourceType) {
          expect(resourceType[0].getText()).toMatch(/^collection$/i);
        });
      });
    });
  });

  describe('resource detail view and method summaries', function() {
    raml = createRAML(
      "title: Example API",
      "baseUri: #{test_api_uri}",
      "/resource:",
      "  get: !!null",
      "  post: !!null",
      "/another-resource:",
      "  get: !!null",
      "  put: !!null",
      "  delete: !!null"
    );

    loadRamlFixture(raml);

    it('provides each method the resource supports', function() {
      getResources().then(function(resources) {
        var resourceMethodSumaries = resources[0].findElements(protractor.By.css('[role="methodSummary"]'));
        expect(resourceMethodSumaries).toHaveLength(2);

        var resource = resources[0];
        resource.findElement(protractor.By.css('.accordion-toggle')).click();
        var topLevelMethods = resource.findElement(protractor.By.css('[role="methods"]'));
        expect(topLevelMethods.isDisplayed()).toBeFalsy()

        var resourceMethodSumaries = resources[1].findElements(protractor.By.css('[role="methodSummary"]'));
        expect(resourceMethodSumaries).toHaveLength(3);
      });

      var firstMethodSpan = ptor.findElement(protractor.By.css('[role="resource"] [role="method"]'));
      expect(firstMethodSpan.getText()).toMatch(/get/i)

      var path = ptor.findElement(protractor.By.css('[role="resource"] [role="methodSummary"] [role="path"]'));
      expect(path.getText()).toEqual('/resource')

      var tryIt = ptor.findElement(protractor.By.css('[role="resource"] [role="methodSummary"] button[role="try-it-tab"]'));
      expect(tryIt.getText()).toMatch(/Try It/i)
    });
  });

  describe('method detail view', function() {
    raml = createRAML(
      'title: Example API',
      'baseUri: #{test_api_uri}',
      '',
      '/resource:',
      '  get:',
      '    description: Get all resources'
    );

   loadRamlFixture(raml);

    it('displays the description of the method', function() {
      var resource = openResource(1);
      var method = openMethod(1, resource);

      var description = method.findElement(protractor.By.css('p'));
      waitUntilTextEquals(description, 'Description: Get all resources');
    });
  });
});
