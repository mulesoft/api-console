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
    '/resourced:',
    '  get:',
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
      expect(resourceGroups).toHaveLength(3);
      expect(resourceGroups[0]).toHaveLength(3);
      expect(resourceGroups[1]).toHaveLength(1);
      expect(resourceGroups[2]).toHaveLength(1);

      var resourceGroupPaths = resourceGroups.map(getGroupPaths);
      expect(resourceGroupPaths[0]).toEqual(['/resource', '/resource/{resourceId}', '/resource/search']);
      expect(resourceGroupPaths[1]).toEqual(['/resourced']);
      expect(resourceGroupPaths[2]).toEqual(['/another/resource']);
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

  parseRAML(createRAML(
    'title: MyApi',
    'traits:',
    '  -  secured:',
    '       description: traity',
    'resourceTypes:',
    '  - collection:',
    '      displayName: a collection',
    '/resource:',
    '  /{resourceId}:',
    '    get: ',
    '    /{filter}:',
    '      type: collection',
    '      is: [secured]',
    '      get: ',
    '      connect: ',
    '      post:',
    '      head:'
  ));

  var resource, resourceOverview, pathSegments;

  beforeEach(function() {
    var allResources = [
      this.api.resources[0],
      this.api.resources[0].resources[0],
      this.api.resources[0].resources[0].resources[0]
    ];

    pathSegments = allResources.map(RAML.Client.createPathSegment);
    resource = allResources[2];

    resourceOverview = RAML.Inspector.resourceOverviewSource(pathSegments, resource);
  });

  it("copies the supplied path segments", function() {
    expect(resourceOverview.pathSegments).toEqual(pathSegments);
  });

  it("translates resource.is to traits", function() {
    expect(resourceOverview.traits).toEqual(resource.is);
    expect(resourceOverview.is).toBeUndefined();
  });

  it("translates resource.type to resourceType", function() {
    expect(resourceOverview.resourceType).toEqual(resource.type);
    expect(resourceOverview.type).toBeUndefined();
  });

  it("creates a method overview for each method", function() {
    expect(resourceOverview.methods.length).toEqual(4);
  });

  it("sorts the methods according to priority", function() {
    var methodNames = resourceOverview.methods.map(function(method) { return method.method; });

    expect(methodNames).toEqual(['get', 'post', 'head', 'connect']);
  });

  it('merges parent uriParameters onto the uriParametersForDocumentation property', function() {
    expect(resourceOverview.uriParametersForDocumentation.resourceId).toBeDefined();
    expect(resourceOverview.uriParametersForDocumentation.filter).toBeDefined();
  });

  it('adds toString', function() {
    expect(resourceOverview.toString()).toEqual('/resource/{resourceId}/{filter}');
  });
});
