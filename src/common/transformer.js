/**
 * Transform raml-js-parser-2 output nodes to the format expected by API Console
 */
RAML.Transformer = (function() {
  'use strict';

  var PARAMETER = /\{\*\}/;
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
    resource.methods = nullIfEmpty(resource.methods());

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

  function transformBodyItem(bodyItem) {
    bodyItem.formParameters = bodyItem.formParameters();
    bodyItem.schema = bodyItem.schema() ? bodyItem.schema().attr.value() : bodyItem.schema();
    bodyItem.example = bodyItem.example() ? bodyItem.example().attr.value() : bodyItem.example();

    return bodyItem;
  }

  function transformBody(body) {
    if (body) {
      var newBody = {};
      body.forEach(function (bodyItem) {
        newBody[bodyItem.name()] = transformBodyItem(bodyItem);
      });
      return newBody;
    }
    return body;
  }

  function transformSecuritySchemes(method) {
    // TODO: revisit when/if parser implements expand on securedBy
    method.securedBy = method.securedBy();
    method.securitySchemes = {};

    if (method.securedBy.length === 0) {
      method.securitySchemes.anonymous = {
        type: 'Anonymous'
      };
      method.securedBy.push('anonymous');
    }

    return method;
  }

  function transformMethod(method) {
    method.body = transformBody(nullIfEmpty(method.body()));
    method.description = getValueIfNotNull(method.description()),
    method.headers = transformHeaders(method.headers());
    method.method = method.method();
    method.queryParameters = nullIfEmpty(method.queryParameters());
    method.responseCodes = method.responseCodes;
    method.reponses = nullIfEmpty(method.responses());

    transformSecuritySchemes(method);

    method.is = nullIfEmpty(typeof method.is === 'function'  ? method.is() : method.is);
    return method;
  }
  exports.transformMethod = transformMethod;

  function nullIfEmpty(array) {
    return array && array.length > 0 ? array : null;
  }

  function getValueIfNotNull(attribute) {
    return attribute ? attribute.value() : '';
  }

  return exports;
})();
