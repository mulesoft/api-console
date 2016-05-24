(function() {
  'use strict';

  var PARAMETER = /\{\*\}/;

  function wrapWithParameterizedHeader(name, definitions) {
    return definitions.map(function(definition) {
      return RAML.Inspector.ParameterizedHeader.fromRAML(name, definition);
    });
  }

  function filterHeaders(headers) {
    var filtered = {
      plain: {},
      parameterized: {}
    };

    Object.keys(headers || {}).forEach(function(key) {
      if (key.match(PARAMETER)) {
        filtered.parameterized[key] = wrapWithParameterizedHeader(key, headers[key]);
      } else {
        filtered.plain[key] = headers[key];
      }
    });

    if(Object.keys(filtered.plain).length === 0) {
      filtered.plain = null;
    }

    return filtered;
  }

  function processBody(body) {
    var content = body['application/x-www-form-urlencoded'];
    if (content) {
      RAML.Inspector.Properties.normalizeNamedParameters(content.formParameters);
    }

    content = body['multipart/form-data'];
    if (content) {
      RAML.Inspector.Properties.normalizeNamedParameters(content.formParameters);
    }
  }

  function processResponses(responses) {
    Object.keys(responses).forEach(function(status) {
      var response = responses[status];
      if (response) {
        RAML.Inspector.Properties.normalizeNamedParameters(response.headers);
      }
    });
  }

  function securitySchemesExtractor(securitySchemes) {
    securitySchemes = securitySchemes || [];

    return function() {
      var securedBy = this.securedBy || [],
          selectedSchemes = {};

      var overwrittenSchemes = {};

      securedBy.map(function(el) {
        if (el === null) {
          securitySchemes.push({
            anonymous: {
              type: 'Anonymous'
            }
          });
          securedBy.push('anonymous');
        }

        if (typeof el === 'object' && el) {
          var key = Object.keys(el)[0];

          overwrittenSchemes[key] = el[key];
          securedBy.push(key);
        }
      });

      securedBy = securedBy.filter(function(name) {
        return name !== null && typeof name !== 'object';
      });

      securitySchemes.forEach(function(scheme) {
        securedBy.forEach(function(name) {
          if (scheme[name]) {
            selectedSchemes[name] = jQuery.extend(true, {}, scheme[name]);
          }
        });
      });

      Object.keys(overwrittenSchemes).map(function (key) {
        Object.keys(overwrittenSchemes[key]).map(function (prop) {
          if (selectedSchemes[key].settings) {
            selectedSchemes[key].settings[prop] = overwrittenSchemes[key][prop];
          }
        });
      });

      if(Object.keys(selectedSchemes).length === 0) {
        selectedSchemes.anonymous = {
          type: 'Anonymous'
        };
      }

      return selectedSchemes;
    };
  }

  function allowsAnonymousAccess() {
    /*jshint validthis: true */
    var securedBy = this.securedBy || [null];
    return securedBy.some(function(name) { return name === null; });
  }

  RAML.Inspector.Method = {
    create: function(raml, securitySchemes) {
      var method = RAML.Utils.clone(raml);

      method.responseCodes = Object.keys(method.responses || {});
      method.securitySchemes = securitySchemesExtractor(securitySchemes);
      method.allowsAnonymousAccess = allowsAnonymousAccess;
      RAML.Inspector.Properties.normalizeNamedParameters(method.headers);
      RAML.Inspector.Properties.normalizeNamedParameters(method.queryParameters);

      method.headers = filterHeaders(method.headers);
      processBody(method.body || {});
      processResponses(method.responses || {});

      method.plainAndParameterizedHeaders = RAML.Utils.copy(method.headers.plain);
      Object.keys(method.headers.parameterized).forEach(function(parameterizedHeader) {
        method.plainAndParameterizedHeaders[parameterizedHeader] = method.headers.parameterized[parameterizedHeader].map(function(parameterized) {
          return parameterized.definition();
        });
      });

      return method;
    }
  };
})();
