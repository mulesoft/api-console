/**
 * Transform raml-js-parser-2 output nodes to the format expected by API Console
 */
RAML.Transformer = (function() {
  'use strict';

  var exports = {};

  exports.groupResources = function(resources) {
    var resourceGroups = [];
    var basePathSegments = [];
    resources.forEach(function (resource) {
      var resourceGroup = [];

      function buildResourceGroup(pathSegments, aResource) {
        aResource.pathSegments = pathSegments.concat(RAML.Client.createPathSegment(aResource));
        resourceGroup.push(aResource);

        if (aResource.resources().length > 0) {
          aResource.resources().forEach(function (childResource) {
            buildResourceGroup(aResource.pathSegments, childResource);
          });
        }
      }

      buildResourceGroup(basePathSegments, resource);
      resourceGroups.push(resourceGroup);
    });

    return resourceGroups;
  };

  exports.transformResource = function (resource) {
    resource.description = getValueIfNotNull(resource.description());
    resource.resourceType = resource.type() ? transformValue(resource.type()) : null;
    resource.traits = resource.is().length > 0 ? resource.is().map(transformValue) : null;

    return resource;
  };

  exports.transformDocumentation = function(documentation) {
    return documentation.length > 0 ?
      documentation.map(function (doc) {
        return {
          title: doc.title(),
          content: doc.content().attr.value()
        };
      }) : null;
  };

  exports.transformMethods = function(methods) {
    return methods.map(transformMethod);
  };

  function transformValue(value) {
    var val = value.attr.value();
    if (typeof val === 'string') {
      return val;
    } else if (val) {
      return val.valueName();
    }
  }

  function transformMethod(method) {
    method.body = nullIfEmpty(method.body());
    method.description = getValueIfNotNull(method.description()),
    method.headers = method.headers();
    method.method = method.method();
    method.queryParameters = nullIfEmpty(method.queryParameters());
    method.responseCodes = method.responseCodes;

    return method;
  }

  function nullIfEmpty(array) {
    return array.length > 0 ? array : null;
  }

  function getValueIfNotNull(attribute) {
    return attribute ? attribute.value() : '';
  }

  return exports;
})();
