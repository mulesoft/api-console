describe("RAML.Inspector.create", function() {
  var definition = [
    '#%RAML 0.2',
    '---',
    'title: MyApi',
    'baseUri: http://myapi.com',
    '/resource:',
    '  get: !!null',
    '  /{resourceId}:',
    '    get: !!null',
    '/another/resource:',
    '  get: !!null'
  ].join('\n');

  beforeEach(function() {
    this.api = parseRAML(definition);
  });

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
    return {
      method: verb
    }
  }

  var resource = {
    displayName: "Test Resource",
    is: ["secured"],
    type: "Collection",
    methods: [createMethod("get"), createMethod("post")]
  }

  beforeEach(function() {
    this.resourceOverview = RAML.Inspector.resourceOverviewSource(['/resource'], resource);
  });

  it("copies the supplied path segments", function() {
    expect(this.resourceOverview.pathSegments).toEqual(['/resource']);
  });

  it("translates resource.displayName to name", function() {
    expect(this.resourceOverview.name).toEqual(resource.displayName);
  });

  it("reduces the methods to an array of http verbs", function() {
    expect(this.resourceOverview.methods).toEqual(['get', 'post']);
  });

  it("translates resource.is to traits", function() {
    expect(this.resourceOverview.traits).toEqual(resource.is);
  });

  it("translates resource.type to resourceType", function() {
    expect(this.resourceOverview.resourceType).toEqual(resource.type);
  });
});
