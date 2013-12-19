describe("RAML.Directives.resource", function() {
  beforeEach(module('ramlConsoleApp'));

  var scope, $el;

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
