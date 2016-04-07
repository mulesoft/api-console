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

    if (Array.isArray(value)) {
      cleanedValue = value.map(function (arrayItem) {
        return cleanupPropertyValue(arrayItem[0]);
      });
    } else {
      Object.keys(value).forEach(function (key) {
        cleanedValue[key] = cleanupPropertyValue(value[key] ? value[key][0] : value[key]);

        // Remove empty array property
        if (!cleanedValue[key][0]) {
          delete cleanedValue[key];
        }
      });
    }

    return cleanedValue;
  }

  RAML.Inspector.Properties = {
    normalizeNamedParameters: normalizeNamedParameters,
    cleanupPropertyValue: cleanupPropertyValue
  };
})();
