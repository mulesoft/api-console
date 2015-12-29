/**
 * Transform raml-js-parser-2 output nodes to the format expected by API Console
 */
RAML.Transformer = (function() {
  'use strict';

  var PARAMETER = /\{\*\}/;
  var exports = {};

  exports.getValueIfNotNull = function(attribute) {
    return attribute ? attribute.value() : '';
  };

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
    resource.description = exports.getValueIfNotNull(resource.description());
    resource.resourceType = resource.type() ? transformValue(resource.type()) : null;
    resource.traits = resource.is().length > 0 ? resource.is().map(transformValue) : null;
    resource.methods = nullIfEmpty(resource.methods());

    return resource;
  };

  exports.transformResourceType = function (resourceType) {
    return resourceType ? transformValue(resourceType) : null;
  };

  exports.transformTraits = function (traits) {
    return traits.length > 0 ?
      traits.map(transformValue).join(', ') : null;
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
    if (value && value.attr) {
      var val = value.attr.value();
      if (typeof val === 'string') {
        return val;
      } else if (val) {
        return val.valueName();
      }
    }
  }
  exports.transformValue = transformValue;

  function filterHeaders(headers) {
    var filtered = {
      plain: {},
      parameterized: {}
    };

    Object.keys(headers || {}).forEach(function(key) {
      if (key.match(PARAMETER)) {
        // filtered.parameterized[key] = wrapWithParameterizedHeader(key, headers[key]);
      } else {
        filtered.plain[key] = headers[key];
      }
    });

    if(Object.keys(filtered.plain).length === 0) {
      filtered.plain = null;
    }

    return filtered;
  }

  function ensureArray(value) {
    if (value === undefined || value === null) {
      return;
    }

    return (value instanceof Array) ? value : [ value ];
  }

  function normalizeNamedParameters(parameters) {
    Object.keys(parameters || {}).forEach(function(key) {
      parameters[key] = ensureArray(parameters[key]);
    });
  }

  function transformHeader(header) {
    header.displayName = header.displayName();

    return header;
  }

  function transformHeaders(headers) {
    var newHeaders = {};
    headers.forEach(function (header) {
      newHeaders[header.name()] = transformHeader(header);
    });

    normalizeNamedParameters(newHeaders);

    return filterHeaders(newHeaders);
  }

  function transformBodyItem(aBodyItem) {
    // TODO: handle all possible types
    var bodyItem = {};
    // This will only be true with RAML 0.8
    if (aBodyItem.constructor.name === 'BodyLikeImpl') {
      bodyItem.formParameters = aBodyItem.formParameters();
      // TODO: handle the situation where schema/example is a reference.
      bodyItem.schema = aBodyItem.schema() ? aBodyItem.schema().attr.value() : aBodyItem.schema();
      bodyItem.example = aBodyItem.example() ? aBodyItem.example().attr.value() : aBodyItem.example();
    }
    return bodyItem;
  }

  function transformBody(body) {
    if (body && body.length > 0) {
      var newBody = {};
      body.forEach(function (bodyItem) {
        newBody[bodyItem.name()] = transformBodyItem(bodyItem);
      });
      return newBody;
    }
  }
  exports.transformBody = transformBody;

  function transformSecuritySchemes(newMethod, oldMethod) {
    // TODO: revisit when/if parser implements expand on securedBy
    newMethod.securedBy = oldMethod.securedBy();
    newMethod.securitySchemes = {};

    if (newMethod.securedBy.length === 0) {
      newMethod.securitySchemes.anonymous = {
        type: 'Anonymous'
      };
      newMethod.securedBy.push('anonymous');
    }

    return newMethod;
  }

  function transformMethod(aMethod) {
    var method = {};
    method.body = transformBody(nullIfEmpty(aMethod.body()));
    method.description = exports.getValueIfNotNull(aMethod.description()),
    method.headers = transformHeaders(aMethod.headers());
    method.method = aMethod.method();
    method.queryParameters = nullIfEmpty(aMethod.queryParameters());
    method.responseCodes = aMethod.responses().map(function (response) {
      return response.code().attr.value();
    });
    method.responses = {};
    aMethod.responses().forEach(function (response) {
      method.responses[response.code().attr.value()] = response;
    });

    transformSecuritySchemes(method, aMethod);

    method.is = nullIfEmpty(aMethod.is());
    return method;
  }
  exports.transformMethod = transformMethod;

  function nullIfEmpty(array) {
    return array && array.length > 0 ? array : null;
  }
  exports.nullIfEmpty = nullIfEmpty;

  return exports;
})();
