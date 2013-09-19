(function() {
  function extractMethods(resource) {
    var mapper = function(method) { return method.method; }
    return (resource.methods || []).map(mapper);
  }

  function extractResources(basePathSegments, api, resourceOverviewSource) {
    var resources = [];

    api.resources.forEach(function(resource) {
      var pathSegments = basePathSegments.concat(resource.relativeUri);

      resources.push(resourceOverviewSource(pathSegments, resource));
      if (resource.resources) {
        extracted = extractResources(pathSegments, resource, resourceOverviewSource);
        extracted.forEach(function(resource) {
          resources.push(resource);
        });
      }
    });

    return resources;
  }

  RAML.Inspector = {
    create: function(api) {
      var resources = extractResources([], api, this.resourceOverviewSource)
      return {
        title: api.title,
        resources: resources
      }
    },

    resourceOverviewSource: function(pathSegments, resource) {
      return {
        pathSegments: pathSegments,
        name: resource.displayName,
        methods: extractMethods(resource),
        traits: resource.is,
        resourceType: resource.type
      }
    }
  }
})();
