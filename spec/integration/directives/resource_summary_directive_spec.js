describe("RAML.Directives.resourceSummary", function() {
  beforeEach(module('ramlConsoleApp'));

  var scope, $el;

  describe("given RAML with a resourceType with parameters", function() {
    var raml = createRAML(
      'title: Test',
      'resourceTypes:',
      '  - typedcollection: {}',
      '/somewhere:',
      '  type: typedcollection',
      '  get:'
    );

    beforeEach(function() {
      compileWithScopeFromFirstResourceAndMethodOfRAML('<resource-summary></resource-summary>', raml);
   });

    it("displays the name of the resourceType", function() {
      var resourceType = this.$el.find('[role="resourceType"]').text();
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
      compileWithScopeFromFirstResourceAndMethodOfRAML('<resource-summary></resource-summary>', raml);
    });

    it("displays only the name of the trait", function() {
      var traits = this.$el.find('[role="traits"]').text().trim();
      expect(traits).toEqual('chau');
    });


  });

});
