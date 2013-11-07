describe("RAML.Directives.pathBuilder", function() {
  var scope, el;

  function createPathBuilderScope(pathSegments) {
    return createScope(function(scope) {
      scope.method = {};
      scope.resource = { pathSegments: pathSegments };
    });
  }

  beforeEach(module('ramlConsoleApp'));

  describe("a resource with no templated parameters", function() {
    beforeEach(function() {
      var parent = createPathSegment('/resource');
      var child = createPathSegment('/search');

      scope = createPathBuilderScope([parent, child]);
      el = compileTemplate('<path-builder></path-builder>', scope);
    });

    it("renders the path segments", function() {
      expect(el).toHaveText(/\/[\s\S]*resource[\s\S]*\/[\s\S]*search/)
    });
  });

  describe("a resource with templated parameters", function() {
    beforeEach(function() {
      var parent = createPathSegment('/resource');
      var child = createPathSegment("/{resourceId}list{format}", {
        resourceId: fakeUriParameter(),
        format: fakeUriParameter(),
      });

      scope = createPathBuilderScope([parent, child]);
      el = compileTemplate('<path-builder></path-builder>', scope);
    });

    it("renders templated path segments as input fields", function() {
      expect(el).toHaveText(/\/[\s\S]*resource[\s\S]*list/);

      var inputs = el.find('input');
      expect(inputs[0]).toHaveAttr('placeholder', 'resourceId');
      expect(inputs[1]).toHaveAttr('placeholder', 'format');
    });
  });

  describe("a resource and a sub-resource with templated parameters that have the same name", function() {
    beforeEach(function() {
      var resource1 = createPathSegment('/{resource}', {
        resource: fakeUriParameter()
      });
      var resource2 = createPathSegment('/{resource}', {
        resource: fakeUriParameter()
      });
      scope = createPathBuilderScope([resource1, resource2]);
      el = compileTemplate('<path-builder></path-builder>', scope);

    });

    it("allows each segment to be independently filled", function() {
      var inputs = el.find('input');
      inputs.first().fillIn('first');
      inputs.last().fillIn('last');

      expect(inputs.first().val()).toEqual('first');
      expect(inputs.last().val()).toEqual('last');
    });

  });
});
