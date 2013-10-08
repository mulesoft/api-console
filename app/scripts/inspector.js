RAML.Inspector = (function() {
  var exports = {};

  var extractResources = function(basePathSegments, api) {
    var resources = [];

    api.resources.forEach(function(resource) {
      var pathSegments = basePathSegments.concat(resource.relativeUri);

      resources.push(exports.resourceOverviewSource(pathSegments, resource));
      if (resource.resources) {
        extracted = extractResources(pathSegments, resource);
        extracted.forEach(function(resource) {
          resources.push(resource);
        });
      }
    });

    return resources;
  };

  exports.methodOverviewSource = function(method) {
    return {
      verb: method.method,
      description: method.description,
      queryParameters: method.queryParameters,
      headers: method.headers,
      body: method.body,
      responses: method.responses
    }
  };

  exports.resourceOverviewSource = function(pathSegments, resource) {
    return {
      pathSegments: pathSegments,
      name: resource.displayName,
      methods: (resource.methods || []).map(exports.methodOverviewSource),
      traits: resource.is,
      resourceType: resource.type,
      uriParameters: resource.uriParameters
    }
  };

  exports.create = function(api) {
    var resources = extractResources([], api)
    return {
      title: api.title,
      resources: resources,
      baseUri: api.baseUri
    }
  };

  return exports;
})();
