(function() {
  function extractMethods(resource) {
    var mapper = function(method) { return method.method; }
    return (resource.methods || []).map(mapper);
  }

  function createResourceOverview(pathSegments, resource) {
    return {
      name: resource.displayName,
      pathSegments: pathSegments,
      methods: extractMethods(resource),
      traits: resource.is,
      resourceType: resource.type
    }
  }

  function extractResources(api, basePathSegments) {
    var resources = [];

    api.resources.forEach(function(resource) {
      pathSegments = (basePathSegments || []).concat(resource.relativeUri);

      resources.push(createResourceOverview(pathSegments, resource));
      if (resource.resources) {
        extractResources(resource, pathSegments).forEach(function(resource) {
          resources.push(resource);
        });
      }
    });

    return resources;
  }

  RAML.inspectorFor = function(api) {
    return {
      resources: extractResources(api)
    }
  }
})()
