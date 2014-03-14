describe("RAML.Animations.popUp", function() {
  beforeEach(module('ramlConsoleApp'));

  var scope, $el;

  describe("resource method-popup view", function() {
    var resourceType, trait, description, raml = createRAML(
      'title: API',
      'resourceTypes:',
      '  - someType: {}',
      'traits:',
      '  - someTrait: {}',
      '/somewhere:',
      '  type: someType',
      '  is: [someTrait]',
      '  description: Some description',
      '  get:'
    );

    parseRAML(raml);

    beforeEach(function() {
      scope = createScope(function(scope) {
        scope.api = RAML.Inspector.create(this.api);
        scope.resource = scope.api.resources[0];
        scope.ramlConsole = { keychain: {} };
      }.bind(this));

      $el = compileTemplate('<div role="api-console"><resource></resource></div>', scope);
      setFixtures($el);

      resourceType = $el.find('[role="resource-type"]');
      trait = $el.find('[role="trait"]');
      description = $el.find('[role="description"]');
    });

    beforeEach(inject(function($animate, DataStore) {
      scope.resourceView.initiateExpand(scope.resource.methods[0]);

      var done = false;
      runs(function() {
        RAML.Animations.popUp(DataStore).beforeAddClass(angular.element($el), 'pop-up', function() {
          RAML.Animations.popUp(DataStore).addClass(angular.element($el), 'pop-up', function() {
            done = true
          })
        })
      })
      waitsFor(function() { return done; });
    }));

    it("automatically shows types and traits", function() {
      expect(resourceType).toBeVisible();
      expect(trait).toBeVisible();
    });

    it("does not hide types and traits when clicked", function() {
      click($el.find('[role="resource-summary"]'));
      expect(resourceType).toBeVisible();
      expect(trait).toBeVisible();
    });
  });
});
