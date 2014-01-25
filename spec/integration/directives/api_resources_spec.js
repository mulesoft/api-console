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
      expect($el.find('[role="resource-group-placeholder"]')).not.toBeVisible();
      expect($el.find('[role="resource"]').eq(0)).toBeVisible();
      expect($el.find('[role="resource"]').eq(1)).toBeVisible();
    });

    it("collapses on clicking the caret", function() {
      click($el.find('[role="resource-group"] > i'));
      expect($el.find('[role="resource-group-placeholder"]')).toBeVisible();

      expect($el.find('[role="resource"]').eq(0)).not.toBeVisible();
      expect($el.find('[role="resource"]').eq(1)).not.toBeVisible();
    });
  });

  describe('collapsing all', function() {
    beforeEach(function() {
      click($el.find('[role="collapse-all"]'));
    });

    it('hides', function() {
      expect($el.find('[role="resource-group-placeholder"]')).toBeVisible();
      expect($el.find('[role="resource"]')).not.toBeVisible();
    });
  });

  describe('expanding all', function() {
    beforeEach(function() {
      click($el.find('[role="collapse-all"]'));
      click($el.find('[role="expand-all"]'));
    });

    it('shows', function() {
      expect($el.find('[role="resource-group-placeholder"]')).not.toBeVisible();
      expect($el.find('[role="resource"]')).toBeVisible();
    });
  });
});
