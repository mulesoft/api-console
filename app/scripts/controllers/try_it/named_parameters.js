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
      if (object[key] && (typeof object[key] !== 'string' || object[key].trim().length > 0)) {
        copy[key] = object[key];
      }
    });

    return copy;
  }

  var NamedParameters = function(plain, parameterized) {
    this.plain = copy(plain);
    this.parameterized = parameterized;
    this.values = {};
  };

  NamedParameters.prototype.create = function(name, value) {
    var parameters = this.parameterized[name];

    var definition = Object.keys(parameters).map(function(key) {
      return parameters[key].create(value);
    });

    this.plain[definition[0].displayName] = new RAML.Controllers.TryIt.NamedParameter(definition);
  };

  NamedParameters.prototype.remove = function(name) {
    return delete this.plain[name];
  };

  NamedParameters.prototype.data = function() {
    return filterEmpty(this.values);
  };

  RAML.Controllers.TryIt.NamedParameters = NamedParameters;
})();
