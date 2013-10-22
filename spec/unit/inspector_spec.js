describe("RAML.Inspector.create", function() {
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
    '  get: !!null',
    '  /{resourceId}:',
    '    get: !!null',
    '/resource/search:',
    '  get: !!null',
    '/another/resource:',
    '  get:',
    '    securedBy: [basic, oauth_2]'
  ));

  describe("inspecting an api's resources", function() {
    var inspector;

    beforeEach(function() {
      resourceOverviewSourceSpy = spyOn(RAML.Inspector, 'resourceOverviewSource').andCallThrough();
      inspector = RAML.Inspector.create(this.api)
    });

    function getGroupPaths(resourceGroup) {
      return resourceGroup.map(function(resource) {
        return resource.pathSegments.join('');
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
      expect(resourceOverviewSourceSpy).toHaveBeenCalledWith(['/resource'], jasmine.any(Object));
      expect(resourceOverviewSourceSpy).toHaveBeenCalledWith(['/resource', '/{resourceId}'], jasmine.any(Object));
      expect(resourceOverviewSourceSpy).toHaveBeenCalledWith(['/another', '/resource' ], jasmine.any(Object));
    });

    describe("query a resource method's security schemes", function() {
      var method;

      describe("when a method is secured by Basic Authentication", function() {
        beforeEach(function() {
          method = inspector.resources[3].methods[0];
        });

        it("returns true", function() {
          expect(method.requiresBasicAuthentication()).toBeTruthy();
        });
      });

      describe("when a method is not secured by Basic Authentication", function() {
        beforeEach(function() {
          method = inspector.resources[0].methods[0];
        });

        it("returns false", function() {
          expect(method.requiresBasicAuthentication()).toBeFalsy();
        });
      });
    });

    describe("when a method is secured by OAuth 2", function() {
      beforeEach(function() {
        method = inspector.resources[3].methods[0];
      });

      it("returns true", function() {
        expect(method.requiresOauth2()).toBeTruthy();
      });
    });

    describe("when a method is not secured by OAuth 2", function() {
      beforeEach(function() {
        method = inspector.resources[0].methods[0];
      });

      it("returns false", function() {
        expect(method.requiresOauth2()).toBeFalsy();
      });
    });
  });
});

describe("RAML.Inspector.resourceOverviewSource", function() {
  function createMethod(verb) {
    return verb;
  }

  var resource = {
    displayName: "Test Resource",
    is: ["secured"],
    type: "Collection",
    methods: [createMethod("get"), createMethod("post")],
    uriParameters: {
      query: {
        type: 'string'
      }
    }
  }

  beforeEach(function() {
    this.resourceOverview = RAML.Inspector.resourceOverviewSource(['/resource'], resource);
  });

  it("copies the supplied path segments", function() {
    expect(this.resourceOverview.pathSegments).toEqual(['/resource']);
  });

  it("copies URI parameters", function() {
    expect(this.resourceOverview.uriParameters).toEqual(resource.uriParameters);
  });

  it("translates resource.displayName to name", function() {
    expect(this.resourceOverview.name).toEqual(resource.displayName);
  });

  it("translates resource.is to traits", function() {
    expect(this.resourceOverview.traits).toEqual(resource.is);
  });

  it("translates resource.type to resourceType", function() {
    expect(this.resourceOverview.resourceType).toEqual(resource.type);
  });

  it("creates a method overview for each method", function() {
    expect(this.resourceOverview.methods).toEqual(['get', 'post']);
  });
});
