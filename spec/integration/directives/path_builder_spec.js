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
      expect(el).toHaveText(/\/resource[\s\S]*\/search/)
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
      expect(el).toHaveText(/\/resource[\s\S]*list/);

      var inputs = el.find('input');
      expect(inputs[0]).toHaveAttr('placeholder', 'resourceId');
      expect(inputs[1]).toHaveAttr('placeholder', 'format');
    });
  });
});
