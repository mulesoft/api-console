RAML.Inspector = (function() {
  var exports = {};

  function extendMethod(api, method) {
    method.requiresBasicAuthentication = function() {
      var required = false,
          securitySchemes = api.securitySchemes || [],
          securedBy = this.securedBy || [];

      securitySchemes.forEach(function(scheme) {
        securedBy.forEach(function(type) {
          if (scheme[type] && scheme[type].type === "Basic Authentication") {
            required = true;
          }
        });
      });

      return required;
    }
  }

  function extractResources(basePathSegments, api) {
    var resources = [];

    api.resources.forEach(function(resource) {
      var pathSegments = basePathSegments.concat(resource.relativeUri);
      var overview = exports.resourceOverviewSource(pathSegments, resource);
      overview.methods.forEach(function(method) {
        extendMethod(api, method);
      });

      resources.push(overview);

      if (resource.resources) {
        extracted = extractResources(pathSegments, resource);
        extracted.forEach(function(resource) {
          resources.push(resource);
        });
      }
    });

    return resources;
  };

  exports.resourceOverviewSource = function(pathSegments, resource) {
    var methods = (resource.methods || []);

    return {
      pathSegments: pathSegments,
      name: resource.displayName,
      methods: methods,
      traits: resource.is,
      resourceType: resource.type,
      uriParameters: resource.uriParameters
    }
  };

  exports.create = function(api) {
    api.resources = extractResources([], api);
    return api;
  };

  return exports;
})();
