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

  RAML.Inspector.Properties = {
    normalizeNamedParameters: normalizeNamedParameters
  };
})();
