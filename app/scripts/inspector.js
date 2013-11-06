'use strict';

RAML.Inspector = (function() {
  var exports = {};

  var METHOD_ORDERING = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'TRACE', 'CONNECT'];

  function extendMethod(method, securitySchemes) {
    securitySchemes = securitySchemes || [];

    var securitySchemeFor = function(method, schemeType) {
      var required, securedBy = method.securedBy || [];

      securitySchemes.forEach(function(scheme) {
        securedBy.forEach(function(type) {
          if (scheme[type] && scheme[type].type === schemeType) {
            required = scheme[type];
          }
        });
      });

      return required;
    };

    method.requiresBasicAuthentication = function() {
      return securitySchemeFor(this, 'Basic Authentication');
    };

    method.requiresOauth2 = function() {
      return securitySchemeFor(this, 'OAuth 2.0');
    };
  }

  function extractResources(basePathSegments, api, securitySchemes) {
    var resources = [], apiResources = api.resources || [];

    apiResources.forEach(function(resource) {
      var resourcePathSegments = basePathSegments.concat(RAML.Client.PathSegment.fromRAML(resource));
      var overview = exports.resourceOverviewSource(resourcePathSegments, resource);

      overview.methods.forEach(function(method) {
        extendMethod(method, securitySchemes);
      });

      resources.push(overview);

      if (resource.resources) {
        var extracted = extractResources(resourcePathSegments, resource, securitySchemes);
        extracted.forEach(function(resource) {
          resources.push(resource);
        });
      }
    });

    return resources;
  }

  function groupResources(resources) {
    var currentPrefix, resourceGroups = [];

    (resources || []).forEach(function(resource) {
      if (resource.pathSegments[0].toString().indexOf(currentPrefix) !== 0) {
        currentPrefix = resource.pathSegments[0].toString();
        resourceGroups.push([]);
      }
      resourceGroups[resourceGroups.length-1].push(resource);
    });

    return resourceGroups;
  }

  exports.resourceOverviewSource = function(pathSegments, resource) {

    resource.traits = resource.is;
    delete resource.is;
    resource.resourceType = resource.type;
    delete resource.type;
    resource.pathSegments = pathSegments;

    resource.methods = (resource.methods || []);

    resource.methods.sort(function(a, b) {
      var aOrder = METHOD_ORDERING.indexOf(a.method.toUpperCase());
      var bOrder = METHOD_ORDERING.indexOf(b.method.toUpperCase());

      return aOrder > bOrder ? 1 : -1;
    });

    return resource;
  };

  exports.create = function(api) {
    api.resources = extractResources([], api, api.securitySchemes);
    api.resourceGroups = groupResources(api.resources);

    return api;
  };

  return exports;
})();
