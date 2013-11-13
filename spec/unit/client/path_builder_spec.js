describe("RAML.Client.PathBuilder", function() {
  var pathBuilder;

  describe("creating a template function from an array of path segments", function() {
    beforeEach(function() {
      var parent = createParameterizedString("/{resource}", {
        resource: fakeUriParameter()
      });

      var child = createParameterizedString("/{resourceId}", {
        resourceId: fakeUriParameter()
      });

      pathBuilder = RAML.Client.PathBuilder.create([parent, child]);
    });

    it("renders the path from an array of contexts", function() {
      expect(pathBuilder([{resource: 'things'}, {resourceId: '1'}])).toEqual("/things/1")
    });
  });
});
