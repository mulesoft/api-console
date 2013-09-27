describe("RAML.Directives.resourceSummary", function() {
  beforeEach(module('ramlConsoleApp'));

  var scope, el;

  describe('given RAML with a resourceType with parameters', function() {
    beforeEach(inject(function($compile, $rootScope) {
      scope = $rootScope.$new();
      scope.resource = {
        resourceType: {
          typedcollection: {
            schema: 'someschema'
          }
        }
      }

      el = $compile('<resource-summary></resource-summary>')(scope);
      scope.$digest();
    }));

    it('displays the name of the resourceType', function() {
      var resourceType = $(el).find("[role=resourceType]").text();
      expect(resourceType).toEqual('typedcollection');
    });

  });

});
