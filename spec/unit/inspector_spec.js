describe("RAML.Inspector.create", function() {
  beforeEach(function() {
    this.addMatchers({
      toHaveCreatedResourceOverviewFrom: function(expectedSegments) {
        var calls = this.actual.calls;

        return calls.some(function(call) {
          var actualSegments = (call.args[0] || []).map(function(segment) {
            return segment.toString();
          });

          return actualSegments.every(function(segment, i) { return segment === expectedSegments[i]});
        });
      }
    });
  });

  var resourceOverviewSpy;
  parseRAML(createRAML(
    'title: MyApi',
    'baseUri: http://myapi.com',
    'securitySchemes:',
    '  - basic:',
    '      type: Basic Authentication',
    '  - oauth_2:',
    '      type: OAuth 2.0',
    '      settings:',
    '        accessTokenUri: http://example.com',
    '        authorizationUri: http://example.com',
    '/resource:',
    '  description: The first resource',
    '  get:',
    '    securedBy: [basic]',
    '  /{resourceId}:',
    '    get: !!null',
    '/resource/search:',
    '  get: !!null',
    '/another/resource:',
    '  get:',
    '    securedBy: [null, basic, oauth_2: { scopes: [ comments ] } ]'
  ));

  describe("inspecting an api's resources", function() {
    var inspector;

    beforeEach(function() {
      resourceOverviewSourceSpy = spyOn(RAML.Inspector, 'resourceOverviewSource').andCallThrough();
      inspector = RAML.Inspector.create(this.api)
    });

    function getGroupPaths(resourceGroup) {
      return resourceGroup.map(function(resource) {
        return resource.pathSegments.map(function(segment) {return segment.toString();}).join('');
      });
    }

    it("provides an array of resources grouped by initial path segments", function() {
      var resourceGroups = inspector.resourceGroups;
      expect(resourceGroups).toHaveLength(2);
      expect(resourceGroups[0]).toHaveLength(3);
      expect(resourceGroups[1]).toHaveLength(1);

      var resourceGroupPaths = resourceGroups.map(getGroupPaths);
      expect(resourceGroupPaths[0]).toEqual(['/resource', '/resource/{resourceId}', '/resource/search']);
      expect(resourceGroupPaths[1]).toEqual(['/another/resource']);
    });

    it("creates a resource overview for each resource", function() {
      expect(resourceOverviewSourceSpy).toHaveCreatedResourceOverviewFrom(['/resource']);
      expect(resourceOverviewSourceSpy).toHaveCreatedResourceOverviewFrom(['/resource', '/{resourceId}']);
      expect(resourceOverviewSourceSpy).toHaveCreatedResourceOverviewFrom(['/another/resource']);
    });
  });
});

describe("RAML.Inspector.resourceOverviewSource", function() {
  function createMethod(verb) {
    return {
      method: verb
    };
  }

  var resource = {
    description: "The long description about test resource",
    displayName: "Test Resource",
    is: ["secured"],
    type: "Collection",
    methods: [createMethod("connect"), createMethod("post"), createMethod("get"), createMethod("head")],
    uriParameters: {
      query: {
        type: 'string'
      }
    }
  }

  beforeEach(function() {
    this.resourceOverview = RAML.Inspector.resourceOverviewSource(['/resource'], resource);
  });

  it("copies the description", function() {
    expect(this.resourceOverview.description).toEqual(resource.description);
  });

  it("copies the supplied path segments", function() {
    expect(this.resourceOverview.pathSegments).toEqual(['/resource']);
  });

  it("copies URI parameters", function() {
    expect(this.resourceOverview.uriParameters).toEqual(resource.uriParameters);
  });

  it("copies resource.displayName to displayName", function() {
    expect(this.resourceOverview.displayName).toEqual(resource.displayName);
  });

  it("translates resource.is to traits", function() {
    expect(this.resourceOverview.traits).toEqual(resource.is);
  });

  it("translates resource.type to resourceType", function() {
    expect(this.resourceOverview.resourceType).toEqual(resource.type);
  });

  it("creates a method overview for each method", function() {
    expect(this.resourceOverview.methods.length).toEqual(4);
  });

  it("sorts the methods according to priority", function() {
    var methodNames = this.resourceOverview.methods.map(function(method) { return method.method; });

    expect(methodNames).toEqual(['get', 'post', 'head', 'connect']);
  });
});
