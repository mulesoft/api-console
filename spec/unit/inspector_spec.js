describe("RAML.Inspector.create", function() {
  var resourceOverviewSpy;
  parseRAML(createRAML(
    'title: MyApi',
    'baseUri: http://myapi.com',
    '/resource:',
    '  get: !!null',
    '  /{resourceId}:',
    '    get: !!null',
    '/another/resource:',
    '  get: !!null'
  ));

  describe("inspecting an api's resources", function() {
    beforeEach(function() {
      resourceOverviewSourceSpy = spyOn(RAML.Inspector, 'resourceOverviewSource');
      this.inspector = RAML.Inspector.create(this.api)
    });

    it("flattens nested resources", function() {
      var resources = this.inspector.resources;
      expect(resources).toHaveLength(3);
    });

    it("creates a resource overview for each resource", function() {
      expect(resourceOverviewSourceSpy).toHaveBeenCalledWith(['/resource'], jasmine.any(Object));
      expect(resourceOverviewSourceSpy).toHaveBeenCalledWith(['/resource', '/{resourceId}'], jasmine.any(Object));
      expect(resourceOverviewSourceSpy).toHaveBeenCalledWith(['/another/resource' ], jasmine.any(Object));
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
    // expect(methodOverviewSourceSpy).toHaveBeenCalledWith(resource.methods[0], 0, resource.methods);
    // expect(methodOverviewSourceSpy).toHaveBeenCalledWith(resource.methods[1], 1, resource.methods);
    expect(this.resourceOverview.methods).toEqual(['get', 'post']);
  });
});
