describe("RAML.Directives.pathBuilder", function() {
  var scope, el;

  function createBaseUri(uri, baseUriParameters) {
    var raml = { baseUri: uri, baseUriParameters: baseUriParameters };
    return RAML.Client.createBaseUri(raml);
  }

  function createPathBuilderScope(baseUri, pathSegments) {
    return createScope(function(scope) {
      scope.method = {};
      scope.api = { baseUri: baseUri };
      scope.resource = { pathSegments: pathSegments };
    });
  }

  beforeEach(module('ramlConsoleApp'));

  describe("a resource with no templated parameters", function() {
    beforeEach(function() {
      var baseUri = createBaseUri("http://example.com");
      var parent = createParameterizedString('/resource');
      var child = createParameterizedString('/search');

      scope = createPathBuilderScope(baseUri, [parent, child]);
      el = compileTemplate('<path-builder></path-builder>', scope);
    });

    it("renders the path segments", function() {
      expect(el).toHaveText(/http:\/\/example.com[\s\S]*\/resource[\s\S]*\/[\s\S]*search/)
    });
  });

  describe("a resource with templated parameters", function() {
    beforeEach(function() {
      var baseUri = createBaseUri("http://example.com/{thing}", {
        thing: fakeUriParameter()
      });
      var parent = createParameterizedString('/resource');
      var child = createParameterizedString("/{resourceId}list{format}", {
        resourceId: fakeUriParameter(),
        format: fakeUriParameter(),
      });

      scope = createPathBuilderScope(baseUri, [parent, child]);
      el = compileTemplate('<path-builder></path-builder>', scope);
    });

    it("renders templated path segments as input fields", function() {
      expect(el).toHaveText(/http:\/\/example.com[\s\S]*\/resource[\s\S]*list/);

      var inputs = el.find('input');
      expect(inputs[0]).toHaveAttr('placeholder', 'thing');
      expect(inputs[1]).toHaveAttr('placeholder', 'resourceId');
      expect(inputs[2]).toHaveAttr('placeholder', 'format');
    });
  });

  describe("a resource and a sub-resource with templated parameters that have the same name", function() {
    beforeEach(function() {
      var baseUri = createBaseUri("http://www.example.com");
      var resource1 = createParameterizedString('/{resource}', {
        resource: fakeUriParameter()
      });
      var resource2 = createParameterizedString('/{resource}', {
        resource: fakeUriParameter()
      });
      scope = createPathBuilderScope(baseUri, [resource1, resource2]);
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
