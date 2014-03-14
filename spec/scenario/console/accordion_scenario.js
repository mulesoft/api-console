describe("accordion view of API", function() {
  var ptor = protractor.getInstance();

  var getResources = function() {
    return ptor.$$('[role="api-console"] [role="resource"]');
  }

  describe("top-level view", function() {
    raml = [
      '#%RAML 0.8',
      '---',
      'title: Example API',
      'baseUri: http://www.example.com',
      'traits:',
      '  - secured:',
      '      description: Some requests require authentication',
      'resourceTypes:',
      '  - collection:',
      '      description: bunk',
      '/resource:',
      '  get: !!null',
      '  /{resourceId}:',
      '    get: !!null',
      '    post: !!null',
      '/another/resource:',
      '  type: collection',
      '  is: [secured]',
      '  get: !!null'].join('\n');

    loadRamlFixture(raml);

    it("renders an overview of each API resource", function() {
      var body = ptor.$('body');
      expect(body.getText()).toMatch(/Example API/);

      getResources().then(function(resources) {
        expect(resources).toHaveLength(3);
        var methodSummarySelector = '[role="resource-summary"] [role="methods"] li';
        var methodsPromise = resources[0].$$(methodSummarySelector);
        expect(methodsPromise).toHaveLength(1);

        methodsPromise = resources[1].$$(methodSummarySelector);
        expect(methodsPromise).toHaveLength(2);
        methodsPromise.then(function(methods) {
          expect(methods[0].getText()).toMatch(/^get$/i);
          expect(methods[1].getText()).toMatch(/^post$/i);
        });

        methodsPromise = resources[2].$$(methodSummarySelector);
        expect(methodsPromise).toHaveLength(1);

        resources[2].$('.accordion-toggle').click();

        var resourceTypesPromise = resources[2].$$('[role="resource-type"]');
        expect(resourceTypesPromise).toHaveLength(1);
        resourceTypesPromise.then(function(resourceType) {
          expect(resourceType[0].getText()).toMatch(/^collection$/i);
        });
      });
    });
  });

  describe("resource detail view and method summaries", function() {
    raml = createRAML(
      'title: Example API',
      'baseUri: http://www.example.com',
      '/resource:',
      '  description: This resource defeats all others',
      '  get: !!null',
      '  post: !!null',
      '/another-resource:',
      '  get: !!null',
      '  put: !!null',
      '  delete: !!null'
    );

    loadRamlFixture(raml);

    it("provides description and each method the resource supports", function() {
      getResources().then(function(resources) {
        var resource = resources[0];
        resource.$('.accordion-toggle').click();

        var resourceDescription = resources[0].$('[role="description"]');
        expect(resourceDescription.getText()).toEqual('This resource defeats all others');

        var topLevelMethods = resource.$('[role="methods"]');
        expect(topLevelMethods.isDisplayed()).toBeTruthy()

        var method = openMethod(1, resource);
        expect(method.getText()).toMatch(/get/i);
      });
    });
  });

  describe("method expansion", function() {
    raml = createRAML(
      'title: Example API',
      'baseUri: http://www.example.com',
      'traits:',
      '  - sorted:',
      '      queryParameters:',
      '        sort:',
      '          enum: ["asc", "desc"]',
      '/resource:',
      '  get:',
      '    is: ["sorted"]',
      '    description: Get all resources'
    );

   loadRamlFixture(raml);

    it("displays the method description and traits", function() {
      var resource = toggleResource(1);
      var method = openMethod(1, resource);
      var description = method.$('[role="full-description"]');
      var traits = method.$('[role="traits"]');

      expect(description.getText()).toEqual('Get all resources')
      expect(traits.getText()).toEqual('sorted')

      resource = toggleResource(1);
      resource.$('[role="resource-summary"] [role="methods"] li:first-child').click();
      description = method.$('[role="full-description"]');

      expect(description.getText()).toEqual('Get all resources')
    });
  });

  describe("resource grouping", function() {
    raml = createRAML(
      'title: Example API',
      'baseUri: http://www.example.com',
      '/posts:',
      '  get:',
      '    description: Get all resources',
      '/comments:',
      '  post:',
      '/comments/{commentId}:',
      '  get:',
      '/something{weird}:',
      '  put:'
    );

   loadRamlFixture(raml);

    it("groups resources by their first path segment", function() {
      var resourceGroups = ptor.$$('[role="resource-group"]');
      resourceGroups.then(function(groups) {
        expect(groups).toHaveLength(3);
        expect(groups[2].$('[role="resource"] .path').getText()).toEqual('/something{weird}');
      });
    });
  });
});
