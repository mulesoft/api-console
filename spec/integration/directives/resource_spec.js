describe("RAML.Directives.resource", function() {
  beforeEach(module('ramlConsoleApp'));

  var scope, $el;

  describe("resource detail view", function() {
    var resourceType, trait, description, raml = createRAML(
      'title: API',
      'resourceTypes:',
      '  - someType: {}',
      'traits:',
      '  - someTrait: {}',
      '/somewhere:',
      '  type: someType',
      '  is: [someTrait]',
      '  description: Some description'
    );

    parseRAML(raml);

    beforeEach(function() {
      compileWithScopeFromFirstResourceAndMethodOfRAML('<resource></resource>', raml,  function($el) {
        setFixtures($el);
        resourceType = $el.find('[role="resource-type"]');
        trait = $el.find('[role="trait"]');
        description = $el.find('[role="description"]');
      });
    });

    describe("when clicking", function() {
      beforeEach(function() {
        expect(resourceType).not.toBeVisible();
        expect(trait).not.toBeVisible();
        expect(description).not.toBeVisible();

        click(this.$el.find('[role="resource-summary"]'));
      });

      it("expands to show types, traits, and description when clicked", function() {
        expect(resourceType).toBeVisible();
        expect(trait).toBeVisible();
        expect(description).toBeVisible();
      });

      describe("when clicking a second time", function() {
        beforeEach(function() {
          click(this.$el.find('[role="resource-summary"]'));
        });

        it('collapses', function() {
          expect(resourceType).not.toBeVisible();
          expect(trait).not.toBeVisible();
          expect(description).not.toBeVisible();
        });
      });
    });
  });

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
      compileWithScopeFromFirstResourceAndMethodOfRAML('<resource></resource>', raml,  function($el) {
        setFixtures($el);
        resourceType = $el.find('[role="resource-type"]');
        trait = $el.find('[role="trait"]');
        description = $el.find('[role="description"]');

        click($el.find('[role="methods"] li'));
      });
    });

    it("automatically shows types and traits", function() {
      expect(resourceType).toBeVisible();
      expect(trait).toBeVisible();
    });

    it("hides resource description", function() {
      expect(description).not.toBeVisible();
    });

    it("does not hide types and traits when clicked", function() {
      click(this.$el.find('[role="resource-summary"]'));
      expect(resourceType).toBeVisible();
      expect(trait).toBeVisible();
    });
  });

  describe("given RAML with a resourceType with parameters", function() {
    var raml = createRAML(
      'title: Test',
      'resourceTypes:',
      '  - typedcollection:',
      '      description: hi',
      '/somewhere:',
      '  type: typedcollection',
      '  get:'
    );

    parseRAML(raml);

    beforeEach(function() {
      var inspected = RAML.Inspector.create(this.api);
      scope = createScope();
      scope.resource = inspected.resources[0];
      scope.method = scope.resource.methods[0];

      $el = compileTemplate('<resource></resource>', scope)
    });

    it("displays the name of the resourceType", function() {
      var resourceType = $el.find('[role="resource-type"]').text().trim();
      expect(resourceType).toEqual('typedcollection');
    });
  });

  describe("given RAML with a parameterized trait", function() {
    var raml = createRAML(
      'title: Test',
      'traits:',
      '  - chau:',
      '      displayName: name',
      '      description: <<param1>>',
      '/h:',
      '  is:',
      '    - chau:',
      '       param1: hola',
      '  get:'
    );

    beforeEach(function() {
      compileWithScopeFromFirstResourceAndMethodOfRAML('<resource></resource>', raml);
    });

    it("displays only the name of the trait", function() {
      var traits = this.$el.find('[role="trait"]').text().trim();
      expect(traits).toEqual('chau');
    });
  });
});
