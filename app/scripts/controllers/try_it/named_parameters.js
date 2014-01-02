(function() {
  'use strict';

  function copy(object) {
    var shallow = {};
    Object.keys(object || {}).forEach(function(key) {
      shallow[key] = new RAML.Controllers.TryIt.NamedParameter(object[key]);
    });

    return shallow;
  }

  function filterEmpty(object) {
    var copy = {};

    Object.keys(object).forEach(function(key) {
      var values = object[key].filter(function(value) {
        return value !== undefined && value !== null && (typeof value !== 'string' || value.trim().length > 0);
      });

      if (values.length > 0) {
        copy[key] = values;
      }
    });

    return copy;
  }

  var NamedParameters = function(plain, parameterized) {
    this.plain = copy(plain);
    this.parameterized = parameterized;

    Object.keys(parameterized || {}).forEach(function(key) {
      parameterized[key].created = [];
    });

    this.values = {};
    Object.keys(this.plain).forEach(function(key) {
      this.values[key] = [undefined];
    }.bind(this));
  };

  NamedParameters.prototype.create = function(name, value) {
    var parameters = this.parameterized[name];

    var definition = parameters.map(function(parameterizedHeader) {
      return parameterizedHeader.create(value);
    });

    var parameterizedName = definition[0].displayName;

    parameters.created.push(parameterizedName);
    this.plain[parameterizedName] = new RAML.Controllers.TryIt.NamedParameter(definition);
    this.values[parameterizedName] = [undefined];
  };

  NamedParameters.prototype.remove = function(name) {
    delete this.plain[name];
    delete this.values[name];
    return;
  };

  NamedParameters.prototype.data = function() {
    return filterEmpty(this.values);
  };

  NamedParameters.prototype.copyFrom = function(oldParameters) {
    var parameters = this;

    Object.keys(oldParameters.parameterized || {}).forEach(function(key) {
      if (parameters.parameterized[key]) {
        oldParameters.parameterized[key].created.forEach(function(createdParam) {
          parameters.plain[createdParam] = oldParameters.plain[createdParam];
        });
      }
    });

    var keys = Object.keys(oldParameters.plain || {}).filter(function(key) {
      return parameters.plain[key];
    });

    keys.forEach(function(key) {
      parameters.values[key] = oldParameters.values[key];
    });
  };

  RAML.Controllers.TryIt.NamedParameters = NamedParameters;
})();
