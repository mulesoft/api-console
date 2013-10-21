RAML.Inspector = (function() {
  var exports = {};

  function extendMethod(method, securitySchemes) {
    securitySchemes = securitySchemes || [];

    var securitySchemeFor = function(method, schemeType) {
      var required = undefined,
          securedBy = method.securedBy || [];

      securitySchemes.forEach(function(scheme) {
        securedBy.forEach(function(type) {
          if (scheme[type] && scheme[type].type === schemeType) {
            required = scheme[type];
          }
        });
      });

      return required;
    }

    method.requiresBasicAuthentication = function() {
      return securitySchemeFor(this, "Basic Authentication");
    }

    method.requiresOauth2 = function() {
      return securitySchemeFor(this, "OAuth 2.0");
    }
  }

  function extractResources(basePathSegments, api, securitySchemes) {
    var resources = [];

    api.resources.forEach(function(resource) {
      var pathSegments = basePathSegments.concat(resource.relativeUri);
      var overview = exports.resourceOverviewSource(pathSegments, resource);
      overview.methods.forEach(function(method) {
        extendMethod(method, securitySchemes);
      });

      resources.push(overview);

      if (resource.resources) {
        extracted = extractResources(pathSegments, resource, securitySchemes);
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
    api.resources = extractResources([], api, api.securitySchemes);
    return api;
  };

  return exports;
})();
