describe("RAML.Directives.api_resources", function() {
  beforeEach(module('ramlConsoleApp'));

  var scope, $el, raml = createRAML(
    'title: Example API',
    '/someResource:',
    '  get:',
    '  /nestedResource:',
    '    get:',
    '/one-resource-in-a-group:',
    '  get:'
  );

  parseRAML(raml);

  beforeEach(function() {
    var parsedApi = this.api;
    scope = createScope(function(scope) {
      scope.api = RAML.Inspector.create(parsedApi);
    });
    $el = compileTemplate('<api-resources></api-resources>', scope);
    setFixtures($el);
  });

  describe("resource groups", function() {
    it("is opened by default", function() {
      expect($el.find('[role="resource"]').eq(0)).toBeVisible();
      expect($el.find('[role="resource"]').eq(1)).toBeVisible();
    });

    it("collapses on clicking the caret", function() {
      click($el.find('[role="resource-group"] > div > i'));
      expect($el.find('[role="resource"]').eq(0)).toBeVisible();
      expect($el.find('[role="resource"]').eq(1)).not.toBeVisible();
    });

    it("does not show a caret when there is only 1 resource in a group", function() {
      expect($el.find('[role="resource-group"] > div > i').eq(2)).not.toBeVisible();
    });
  });
});
