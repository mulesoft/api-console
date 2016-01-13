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

  function transformHeaders(headers) {
    var newHeaders = transformNamedParameters(headers);

    normalizeNamedParameters(newHeaders);

    return filterHeaders(newHeaders);
  }
  exports.transformHeaders = transformHeaders;

  function transformBodyItem(aBodyItem) {
    // TODO: handle all possible types
    var bodyItem = {};
    // This will only be true with RAML 0.8
    if (aBodyItem.constructor.name === 'BodyLikeImpl') {
      bodyItem.formParameters = transformNamedParameters(aBodyItem.formParameters());
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
    newMethod.securedBy = oldMethod.allSecuredBy();
    newMethod.securitySchemes = {};

    if (newMethod.securedBy.length === 0) {
      newMethod.securitySchemes.anonymous = {
        type: 'Anonymous'
      };
      newMethod.securedBy.push('anonymous');
    } else {
      newMethod.securedBy = newMethod.securedBy.map(function (securedBy) {
        var securitySchemeKey = securedBy.value().valueName();
        var securityScheme = securedBy.securityScheme();

        newMethod.securitySchemes[securitySchemeKey] = {
          id: securitySchemeKey,
          name: securityScheme.type(),
          settings: transformSettings(securityScheme.settings()),
          type: securityScheme.type()
        };

        var describedBy = securityScheme.describedBy();
        if (describedBy) {
          newMethod.securitySchemes[securitySchemeKey].describedBy = {
            headers: transformNamedParameters(describedBy.headers()),
            queryParameters: transformNamedParameters(describedBy.queryParameters()),
            responses: transformResponses(describedBy.responses())
          };
        }

        return securitySchemeKey;
      });
    }

    return newMethod;
  }

  function transformSettings(settings) {
    if (settings) {
      return {
        accessTokenUri: transformValue(settings.accessTokenUri()),
        authorizationGrants: settings.authorizationGrants(),
        authorizationUri: transformValue(settings.authorizationUri())
      };
    }
  }

  function transformMethod(aMethod) {
    var method = {};
    method.body = transformBody(nullIfEmpty(aMethod.body()));
    method.description = exports.getValueIfNotNull(aMethod.description()),
    method.headers = nullIfEmpty(aMethod.headers());
    method.method = aMethod.method();
    method.queryParameters = nullIfEmpty(aMethod.queryParameters());

    var methodResponseCodes = aMethod.responses().map(function (response) {
      return response.code().attr.value();
    });

    method.responseCodes = methodResponseCodes.length > 0 ?
      methodResponseCodes : null;

    method.responses = transformResponses(aMethod.responses());

    transformSecuritySchemes(method, aMethod);

    method.is = nullIfEmpty(aMethod.is());
    return method;
  }
  exports.transformMethod = transformMethod;

  function transformResponses(responses) {
    var methodResponses = responses.reduce(function (accum, response) {
      accum[response.code().attr.value()] = response;
      return accum;
    }, {});

     return Object.getOwnPropertyNames(methodResponses).length > 0 ?
      methodResponses : null;
  }

  function transformNamedParameters(collection) {
    var result = collection.reduce(function (accum, item) {
      var name = item.name();
      accum[name] = [{
        name: name,
        default: item.default(),
        description: transformValue(item.description()),
        displayName: item.displayName(),
        example: item.example() ? item.example() : undefined,
        repeat: item.repeat(),
        required: item.required(),
        type: item.type(),

        enum: item.enum && item.enum().length > 0 ? item.enum() : undefined,
        maximum: item.maximum ? item.maximum() : undefined,
        maxLength: item.maxLength ? item.maxLength() : undefined,
        minimum: item.minimum ? item.minimum() : undefined,
        minLength: item.minLength ? item.minLength() : undefined,
        pattern: item.pattern ? item.pattern() : undefined
      }];
      return accum;
    }, {});

    return Object.getOwnPropertyNames(result).length > 0 ? result : null;
  }
  exports.transformNamedParameters = transformNamedParameters;

  function nullIfEmpty(array) {
    return array && array.length > 0 ? array : null;
  }
  exports.nullIfEmpty = nullIfEmpty;

  return exports;
})();
