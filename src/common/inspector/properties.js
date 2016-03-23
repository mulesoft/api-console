(function() {
  'use strict';

  function ensureArray(value) {
    if (value === undefined || value === null) {
      return;
    }

    return (value instanceof Array) ? value : [ value ];
  }

  function normalizeNamedParameters(parameters) {
    Object.keys(parameters || {}).forEach(function(key) {
      if (parameters[key].properties) {
        normalizeNamedParameters(parameters[key].properties);
      }

      parameters[key] = ensureArray(parameters[key]);
    });

    return parameters;
  }

  function cleanupPropertyValue(value) {
    if (typeof value !== 'object') {
      return value;
    }
    var cleanedValue = {};
    Object.keys(value).forEach(function (key) {
      cleanedValue[key] = cleanupPropertyValue(value[key] ? value[key][0] : value[key]);
    });

    return cleanedValue;
  }

  RAML.Inspector.Properties = {
    normalizeNamedParameters: normalizeNamedParameters,
    cleanupPropertyValue: cleanupPropertyValue
  };
})();
