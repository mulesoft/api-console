describe("RAML.Directives.resourceSummary", function() {
  beforeEach(module('ramlConsoleApp'));

  var scope, $el;

  describe('given RAML with a resourceType with parameters', function() {
    beforeEach(function() {
      scope = createScope(function(scope) {
        scope.resource = {
          resourceType: {
            typedcollection: {
              schema: 'someschema'
            }
          }
        }
      });

     $el = compileTemplate('<resource-summary></resource-summary>', scope);
   });

    it('displays the name of the resourceType', function() {
      var resourceType = $el.find("[role=resourceType]").text();
      expect(resourceType).toEqual('typedcollection');
    });

  });

});
